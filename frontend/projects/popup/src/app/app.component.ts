import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  distinctUntilChanged,
  filter,
  map,
  pluck,
  shareReplay,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { FileCab } from '@shared/services/file-cab';
import { STATUS_LIST } from '@shared/const';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BrowserApiService } from './services/browser-api.service';
import { BehaviorSubject, combineLatest, from, Observable, of, ReplaySubject } from 'rxjs';
import { ItemType, LibraryItem } from '@shared/models/library';
import { CardData } from './models/card-data';
import { trimTitle } from '@shared/utils/trim-title';
import { Genre } from '@server/api/base';

interface BaseInfo {
  name: string;
  url: string;
  domain: string;
  type: string;
}

interface SearchData {
  name: string;
  type: string;
}

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  statuses = STATUS_LIST;
  types$ = this.fileCab.config$.pipe(
    map(({ types }) => types),
  );
  schemas$ = this.fileCab.config$.pipe(
    map(({ schemas }) => schemas),
  );
  baseInfo$: Observable<BaseInfo>;
  libraryItem$: Observable<LibraryItem<ItemType>>;
  item$: Observable<ItemType>;
  genres$: Observable<Genre[]>;

  private searchData = new ReplaySubject<SearchData>(1);
  searchData$: Observable<SearchData>;

  foundedList$: Observable<ItemType[]>;

  private itemId = new BehaviorSubject<number | null>(null);

  constructor(
    private fileCab: FileCab,
    private browserApiService: BrowserApiService,
  ) {
  }

  ngOnInit(): void {
    this.baseInfo$ = this.createBaseInfo();

    this.searchData$ = this.baseInfo$.pipe(
      tap(({ type, name }) => this.searchData.next({ type, name })),
      switchMap(() => this.searchData),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    this.libraryItem$ = combineLatest([
      this.searchData$,
      this.baseInfo$,
    ]).pipe(
      switchMap(([{ type, name }, baseInfo]) => this
        .fileCab.searchInStore(type, name, baseInfo.url)),
    );

    this.genres$ = this.searchData$.pipe(
      filter(data => !!data.type),
      switchMap(data => this.fileCab.selectGenres(data.type)),
    );

    this.foundedList$ = combineLatest([
      this.libraryItem$,
      this.searchData$,
    ]).pipe(
      distinctUntilChanged(this.searchItemChangedCompare),
      switchMap(([item, cardData]) => {
        if (item) {
          return of([item.item]);
        }

        if (!cardData.type || !cardData.name) {
          return [];
        }

        return this.fileCab
          .searchApi(cardData.type, cardData.name)
          .pipe(pluck('results'));
      }),
    );

    this.item$ = combineLatest([
      this.foundedList$,
      this.itemId,
    ]).pipe(
      map(([list, id]) => {
        if (list.length === 1) {
          return list[0];
        }

        return list.find(it => it.id === id);
      }),
      filter(item => !!item),
    );
  }

  onUpdate(cardData: CardData): void {
    const { type, name, ...metaData } = cardData;

    this.searchData.next({ type, name });

    this.item$.pipe(
      take(1),
      withLatestFrom(this.baseInfo$),
      map(([item, baseInfo]) => ({
        item,
        metaData: {
          ...metaData,
          url: baseInfo.url,
        },
      })),
      switchMap(({ item, metaData }) => this.fileCab.addOrUpdate(type, item, metaData)),
      untilDestroyed(this),
    ).subscribe();
  }

  selectItemId(itemId: number): void {
    this.itemId.next(itemId);
  }

  private createBaseInfo(): Observable<BaseInfo> {
    return this.schemas$.pipe(
      switchMap(schemas => combineLatest([
        of(schemas),
        from(this.browserApiService.getActiveTabTitle(schemas)),
        from(this.browserApiService.getActiveTabLinks()),
      ])),
      map(([schemas, title, { url, domain }]) => {
        const currentScheme = schemas[domain];
        const name = trimTitle(title, currentScheme?.func);

        return {
          type: currentScheme?.type || 'films',
          name,
          url,
          domain,
        };
      }),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private searchItemChangedCompare(
    [prevItem, prevSearch]: [LibraryItem<ItemType> | undefined, SearchData],
    [currItem, currSearch]: [LibraryItem<ItemType> | undefined, SearchData],
  ): boolean {
    if (prevItem) {
      return prevItem?.item.id === currItem?.item.id;
    }

    return prevSearch.type === currSearch.type
      && prevSearch.name === currSearch.name;
  }
}
