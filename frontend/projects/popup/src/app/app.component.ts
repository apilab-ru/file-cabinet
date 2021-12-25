import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { catchError, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { Types } from '@shared/const';
import { UntilDestroy } from '@ngneat/until-destroy';
import { BrowserApiService } from './services/browser-api.service';
import { combineLatest, forkJoin, from, Observable, of } from 'rxjs';
import { trimTitle } from '@shared/utils/trim-title';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaseInfo } from '@shared/popup-add-item/models/base-info';
import { FileCabService } from '@shared/services/file-cab.service';
import { ParserFounded } from './interface';
import { parserPresets } from '@shared/parser/const';
import { captureException } from '@sentry/angular';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  baseInfo$: Observable<BaseInfo | null>;
  schemas$ = this.fileCabService.schemas$;
  parserPreset$: Observable<ParserFounded | null>;

  constructor(
    private browserApiService: BrowserApiService,
    private matSnackBar: MatSnackBar,
    private fileCabService: FileCabService,
  ) {
  }

  ngOnInit(): void {
    this.baseInfo$ = this.createBaseInfo();
    this.parserPreset$ = this.searchPreset();
  }

  onSave(): void {
    this.matSnackBar.open('Сохранено', undefined, {
      duration: 2000,
    });
  }

  private searchPreset(): Observable<ParserFounded | null> {
    return from(this.browserApiService.getActiveTabLinks()).pipe(
      map(({ url, domain }) => {
        const preset = parserPresets.find(it => it.domain === domain);

        return !preset ? null : {
          ...preset,
          founded: preset.host === '*' ? true : preset.host.test(url),
        };
      }),
    );
  }

  private createBaseInfo(): Observable<BaseInfo | null> {
    return this.schemas$.pipe(
      switchMap(schemas => combineLatest([
        of(schemas),
        from(this.browserApiService.getActiveTabTitle(schemas)),
        from(this.browserApiService.getActiveTabLinks()),
      ])),
      map(([schemas, title, { url, domain }]) => ({ schemas, title, url, domain })),
      switchMap(({ schemas, title, url, domain }) => {
        const currentScheme = schemas[domain];
        const name = trimTitle(title, currentScheme?.func).trim();

        return forkJoin([
          this.fileCabService.searchByUrl(url, currentScheme?.type),
          this.fileCabService.searchByName(name, currentScheme?.type),
        ]).pipe(
          map(([itemByUrl, itemByName]) => {
            return {
              schemas,
              title,
              url,
              domain,
              localItem: itemByUrl || itemByName,
            };
          }),
        );
      }),
      map(({ schemas, title, url, domain, localItem }) => {
        const currentScheme = schemas[domain];
        const name = localItem ? localItem.name
          : trimTitle(title, currentScheme?.func);
        const type = localItem ? localItem.type
          : currentScheme?.type || Types.films;

        return {
          type,
          name,
          url,
          domain,
        };
      }),
      catchError((error) => {
        captureException(error);

        return of(null);
      }),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }
}
