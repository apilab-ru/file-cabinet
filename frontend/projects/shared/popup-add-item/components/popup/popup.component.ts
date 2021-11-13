import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CardData } from '@shared/popup-add-item/models/card-data';
import { BehaviorSubject, combineLatest, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { SearchData } from '@shared/popup-add-item/models/search-data';
import { MetaData } from '@shared/models/meta-data';
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
import { ItemType, LibraryItem } from '@shared/models/library';
import { Genre } from '@server/api/base';
import { BaseInfo } from '@shared/popup-add-item/models/base-info';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FileCabService } from '@shared/services/file-cab.service';

@UntilDestroy()
@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopupComponent implements OnInit, OnChanges {
  @Input() baseInfo: BaseInfo;
  @Input() isShowLibrary = true;

  @Output() onSaveEvent = new EventEmitter<LibraryItem<ItemType>>();

  private saveEvent = new Subject<{ type: string, metaData: MetaData }>();
  private searchData = new ReplaySubject<SearchData>(1);
  private itemId = new BehaviorSubject<number | null>(null);
  private baseInfoStory = new BehaviorSubject<BaseInfo | null>(null);

  isLoading$ = new BehaviorSubject(false);
  types$ = this.fileCabService.types$;
  libraryItem$: Observable<LibraryItem<ItemType>>;
  item$: Observable<ItemType>;
  genres$: Observable<Genre[]>;
  foundedList$: Observable<ItemType[]>;
  searchData$: Observable<SearchData>;
  baseInfo$: Observable<BaseInfo>;

  constructor(
    private fileCabService: FileCabService,
  ) {
  }

  ngOnInit(): void {
    this.baseInfo$ = this.baseInfoStory.asObservable().pipe(
      filter(data => !!data),
    );
    this.searchData$ = this.baseInfo$.pipe(
      tap(({ type, name }) => this.searchData.next({ type, name })),
      switchMap(() => this.searchData),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
    this.genres$ = this.searchData$.pipe(
      filter(data => !!data.type),
      switchMap(data => this.fileCabService.selectGenres(data.type)),
    );
    this.libraryItem$ = combineLatest([
      this.searchData$,
      this.baseInfo$,
    ]).pipe(
      switchMap(([{ type, name }, baseInfo]) => this
        .fileCabService.searchInStore(type, name, baseInfo.url)),
    );

    this.foundedList$ = this.createFoundList();

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

    this.saveEvent.asObservable().pipe(
      tap(() => this.isLoading$.next(true)),
      tap(() => this.isLoading$.next(false)),
      switchMap(({ type, metaData }) => this.updateItem(type, metaData)),
      untilDestroyed(this),
    ).subscribe((item) => {
      this.onSaveEvent.emit(item);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.baseInfo) {
      this.baseInfoStory.next(this.baseInfo);
    }
  }

  onUpdate(cardData: CardData): void {
    const { type, name, ...metaData } = cardData;

    this.searchData.next({ type, name });
    this.saveEvent.next({ type, metaData });
  }

  selectItemId(itemId: number): void {
    this.itemId.next(itemId);
  }

  private updateItem(type: string, metaData: MetaData): Observable<LibraryItem<ItemType>> {
    return this.item$.pipe(
      take(1),
      withLatestFrom(this.baseInfo$),
      map(([item, baseInfo]) => ({
        item,
        metaData: {
          ...metaData,
          url: baseInfo.url,
        },
      })),
      switchMap(({ item, metaData }) => this.fileCabService.addOrUpdate(type, item, metaData)),
    );
  }

  private createFoundList(): Observable<ItemType[]> {
    return combineLatest([
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

        return this.fileCabService
          .searchApi(cardData.type, cardData.name)
          .pipe(pluck('results'));
      }),
    );
  }

  private searchItemChangedCompare(
    [prevItem, prevSearch]: [LibraryItem<ItemType> | undefined, SearchData],
    [currItem, currSearch]: [LibraryItem<ItemType> | undefined, SearchData],
  ): boolean {
    if (prevItem) {
      return prevItem?.item.id === currItem?.item.id;
    }

    return prevSearch.type === currSearch.type && prevSearch.name === currSearch.name;
  }

}
