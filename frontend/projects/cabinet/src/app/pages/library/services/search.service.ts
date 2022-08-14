import { Injectable } from '@angular/core';
import {
  BASE_CLEVER_SEARCH_KEYS,
  deepCopy,
  ICleverSearchKeys,
  ISearchStatus,
  ISearchValue,
  LibraryItem,
  LibraryMode,
  Path,
  SearchKeys,
} from '../../../../models';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { FileCabService } from '@shared/services/file-cab.service';
import { Tag } from '@shared/models/tag';
import { StatusList } from '@shared/const/const';
import { Genre } from '@server/models/genre';
import { DataSourceFormService } from './data-source-form.service';
import { OrderField } from '../models/interface';
import { ORDER_DEFAULT } from '../models/const';

const BASE_STATE: ISearchStatus = {
  search: '',
  options: {
    status: [{ value: StatusList.process, positive: true }],
  },
};

const ORDER_FIELD_LIST: OrderField[] = [
  {
    key: ORDER_DEFAULT,
    name: 'Дата добавления',
  },
  {
    key: 'item.title',
    name: 'Название',
  },
  {
    key: 'item.year',
    name: 'Год',
  },
  {
    key: 'star',
    name: 'Оценка',
  },
  {
    key: 'status',
    name: 'Статус',
  },
];

const MAP_MODE_TO_MAX_LIMIT = {
  [LibraryMode.library]: 100,
  [LibraryMode.search]: 50,
};

const MAP_MODE_TO_ORDER_LIST = {
  [LibraryMode.library]: ORDER_FIELD_LIST,
  [LibraryMode.search]: [],
};

@Injectable()
export class SearchService {
  private status = new BehaviorSubject<ISearchStatus>(BASE_STATE);
  private mode = new BehaviorSubject<LibraryMode>(LibraryMode.library);
  private path = new BehaviorSubject<Path | null>(null);

  path$ = this.path.asObservable();
  mode$ = this.mode.asObservable();
  status$ = this.status.asObservable();
  searchKeys$: Observable<ICleverSearchKeys>;
  genres$: Observable<Genre[]>;

  constructor(
    private fileCabService: FileCabService,
    private dataSourceFormService: DataSourceFormService,
  ) {
    this.searchKeys$ = this.createSearchKeys();
    this.setMode(LibraryMode.library);
  }

  setPath(path: Path): void {
    this.path.next(path);
  }

  selectGenre(genre: number): void {
    const status = this.status.getValue() || { options: {}, search: '' };
    this.status.next({
      ...status,
      options: {
        ...status.options,
        genres: [{ positive: true, value: genre }],
      },
    });
  }

  update(status: ISearchStatus): void {
    this.status.next(status);
    this.setPage(1);
  }

  setMode(mode: LibraryMode): void {
    this.mode.next(mode);
    this.dataSourceFormService.setMaxLimit(MAP_MODE_TO_MAX_LIMIT[mode]);
    this.dataSourceFormService.setOrderList(MAP_MODE_TO_ORDER_LIST[mode]);
    this.setPage(1);
  }

  setPage(page: number): void {
    this.dataSourceFormService.setPage(page);
  }

  filterByState(data: LibraryItem[], state: ISearchStatus): LibraryItem[] {
    if (state) {
      state.search = state.search && state.search.toLocaleLowerCase();
      const list = data?.filter(item => this.itemToStateCompare(item, state));
      return list;
    } else {
      return data;
    }
  }

  private createSearchKeys(): Observable<ICleverSearchKeys> {
    this.genres$ = this.path$.pipe(
      switchMap(path => this.fileCabService.selectGenres(path)),
    );

    return combineLatest([
      this.mode$,
      this.fileCabService.tags$,
      this.genres$,
    ]).pipe(
      map(([mode, tags, genres]) => this.loadKeys(mode, genres, tags)),
    );
  }

  private itemToStateCompare(item: LibraryItem, state: ISearchStatus): boolean {
    let isCompare = true;
    isCompare = item.item.title?.toLocaleLowerCase().search(state.search) > -1
      || item.item.originalTitle?.toLocaleLowerCase().search(state.search) > -1
      || item.name?.toLocaleLowerCase().search(state.search) > -1
    ;

    return isCompare
      && (!Object.keys(state.options).length
        || Object.keys(state.options)
          .map(key => this.checkCompare(key as SearchKeys, state.options[key], item))
          .reduce((prev, next) => prev && next, true));
  }

  private checkCompare(key: SearchKeys, value: ISearchValue[], item: LibraryItem): boolean {
    if (!value[0]) {
      return true;
    }

    const separateSearch = this.separateSearchValue(value);
    switch (key) {
      case SearchKeys.genres:
        const searchResGenres = this.compareList(item.item.genreIds.map(id => +id), separateSearch);
        return searchResGenres.positive.reduce((prev, next) => prev && next, true)
          && searchResGenres.negative.reduce((prev, next) => prev && next, true);

      case SearchKeys.years:
        const searchResYears = this.compareList([item.item.year], separateSearch);
        return searchResYears.positive.reduce((prev, next) => prev || next, !searchResYears.positive.length)
          && searchResYears.negative.reduce((prev, next) => prev && next, true);

      case SearchKeys.status:
        const searchResStatus = this.compareList([item.status], separateSearch);
        return searchResStatus.positive.reduce((prev, next) => prev || next, !searchResStatus.positive.length)
          && searchResStatus.negative.reduce((prev, next) => prev && next, true);

      case SearchKeys.ratingFrom:
        return item.star >= value[0].value;

      case SearchKeys.ratingTo:
        return item.star <= value[0].value;

      case SearchKeys.tags:
        const searchResTags = this.compareList(item.tags ? item.tags : [], separateSearch);
        return searchResTags.positive.reduce((prev, next) => prev || next, false)
          && searchResTags.negative.reduce((prev, next) => prev && next, true);
    }
  }

  private compareList(itemValue: (string | number)[], searchSeparate: ISearchValueSeparate): ICompareList {
    return {
      positive: searchSeparate.positive.map(s => (itemValue.indexOf(s.value) > -1) === s.positive),
      negative: searchSeparate.negative.map(s => (itemValue.indexOf(s.value) > -1) === s.positive),
    };
  }

  private separateSearchValue(search: ISearchValue[]): ISearchValueSeparate {
    return {
      positive: search.filter(value => value.positive),
      negative: search.filter(value => !value.positive),
    };
  }

  private loadKeys(mode: LibraryMode, genres: Genre[], tags: Tag[]): ICleverSearchKeys {
    const keys = deepCopy(BASE_CLEVER_SEARCH_KEYS);
    keys.genres.list = genres;
    // keys.tags.list = tags;

    if (mode === LibraryMode.search) {
      delete keys.status;
      delete keys.ratingFrom;
      delete keys.ratingTo;
      // delete keys.tags;
      return {};
    }

    return keys;
  }
}

interface ISearchValueSeparate {
  positive: ISearchValue[];
  negative: ISearchValue[];
}

interface ICompareList {
  positive: boolean[];
  negative: boolean[];
}
