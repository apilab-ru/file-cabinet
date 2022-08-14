import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, concat, from, Observable, of, race, throwError } from 'rxjs';
import { ParserFounded } from '../../interface';
import { catchError, filter, map, mapTo, skip, startWith, switchMap, take, tap } from 'rxjs/operators';
import { BrowserApiService } from '../../services/browser-api.service';
import { ParserPreset, ParserResponse } from '@shared/parser/interface';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FileCabService } from '@shared/services/file-cab.service';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SearchData } from '@shared/popup-add-item/models/search-data';
import { CardData } from '@shared/popup-add-item/models/card-data';
import { MetaData } from '@server/models/meta-data';
import { LibraryItem, MediaItem } from '@server/models';
import { Genre } from '@server/models/genre';

const fullSize = '-full';
const defaultType = 'films';

@UntilDestroy()
@Component({
  selector: 'app-popup-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopupImportComponent implements OnInit {
  @Input() parserPreset: ParserFounded;

  currentType$: Observable<string>;
  genres$: Observable<Genre[]>;
  foundedList$: Observable<MediaItem[] | null>;

  progress$ = new BehaviorSubject<{ current: number, total: number } | null>(null);
  selectedItem$ = new BehaviorSubject<MediaItem | null>(null);
  libraryItem$: Observable<LibraryItem | null>;
  mode$ = new BehaviorSubject<string | null>(null);
  skip$ = new BehaviorSubject<boolean | undefined>(undefined);
  meta$ = new BehaviorSubject<MetaData | null>(null);

  form: FormGroup;

  constructor(
    private browserApiService: BrowserApiService,
    private fileCabService: FileCabService,
    private matSnackBar: MatSnackBar,
  ) {
    this.form = new FormGroup({
      name: new FormControl(''),
      type: new FormControl(defaultType),
    });
  }

  ngOnInit(): void {
    this.currentType$ = this.form.get('type').valueChanges.pipe(startWith(defaultType));
    this.genres$ = this.fileCabService.genres$;
    this.foundedList$ = this.form.valueChanges.pipe(
      switchMap(({ type, name }) => this.fileCabService.searchApi(type, name).pipe(
        map(res => res.results),
      )),
      startWith(null),
    );
  }

  onUpdateSearchData(data: SearchData): void {
    this.form.patchValue(data);
  }

  onUpdate(data: CardData): void {
    const { name, type, ...meta } = data;
    this.meta$.next(meta);
  }

  startImport(preset: ParserPreset): void {
    const prependFunc = '(function() {';
    const afterFunc = '})()';
    const code = prependFunc + preset.func.toString()
      .replace(/function [a-zA-z]*\(\) {/, '')
      .slice(0, -1) + afterFunc;

    const list = this.browserApiService.getActiveTab()
      .then(tab => this.browserApiService.executeScriptOnTab(tab, code));

    from(list).pipe(
      switchMap((list: ParserResponse[]) => this.filterExisted(list)),
      switchMap(list => {
        let current = 0;
        const total = list.length;

        this.progress$.next({ current, total });

        return concat(
          ...list.map(it => this.checkAndAddItem(it).pipe(tap(() => {
            current += 1;
            this.progress$.next({ current, total });
          }))),
        ).pipe(
          filter(() => current >= total),
        );
      }),
      untilDestroyed(this),
    ).subscribe(() => {
      this.progress$.next(null);
      this.matSnackBar.open('Импорт завершён', undefined, {
        duration: 2000,
      });
    }, error => {
      this.matSnackBar.open(error.toString(), undefined, {
        duration: 2000,
      });
    });
  }

  selectItem(item: MediaItem): void {
    this.selectedItem$.next(item);
  }

  skip(): void {
    this.skip$.next(true);
  }

  private checkAndAddItem(parserResponse: ParserResponse): Observable<void> {
    if (parserResponse.smotretId) {
      return this.fileCabService.loadById(parserResponse.type, parserResponse.smotretId).pipe(
        map(item => {
          this.fileCabService.addItemLibToStore(parserResponse.type, {
            ...parserResponse.meta,
            item,
          });
        }),
      );
    }

    return this.searchAddItem(parserResponse);
  }

  private searchAddItem(parserResponse: ParserResponse): Observable<void> {
    return new Observable<undefined>(resolve => {
      this.form.patchValue({
        name: parserResponse.name,
        type: parserResponse.type,
      });
      this.selectedItem$.next(null);
      this.mode$.next('select');
      this.skip$.next(undefined);
      this.meta$.next(parserResponse.meta || {});

      resolve.next(undefined);
    }).pipe(
      switchMap(() => race(
        this.addItem(parserResponse),
        this.skip$.pipe(filter(isSkip => isSkip), mapTo(undefined)),
      )),
      take(1),
      tap(() => this.mode$.next(null)),
    );
  }

  private addItem(parserResponse: ParserResponse): Observable<void> {
    return combineLatest([
      this.selectedItem$,
      this.meta$.pipe(skip(1)),
    ]).pipe(
      filter(([item]) => !!item),
      switchMap(([item, meta]) => {
        const { type } = this.form.getRawValue();
        return this.fileCabService.addItemLibToStore(type || parserResponse.type, {
          ...parserResponse.meta,
          ...meta,
          item,
        });
      }),
      catchError(error => {
        this.matSnackBar.open(error.toString(), undefined, {
          duration: 2000,
        });

        return of(undefined);
      }),
    );
  }

  private filterExisted(list: ParserResponse[]): Observable<ParserResponse[]> {
    if (!list) {
      return throwError('Null list');
    }

    return combineLatest(
      list.map(it => this.fileCabService.checkExisted(it.type || defaultType, {
        smotretId: it.smotretId,
        shikimoriId: it.shikimoriId,
        imdbId: it.imdbId,
        url: it.meta?.url,
      })),
    ).pipe(
      map(existedList => list.filter((it, index) => !existedList[index])),
    );
  }

}
