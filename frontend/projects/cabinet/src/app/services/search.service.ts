import { Injectable } from '@angular/core';
import {
  BASE_CLEVER_SEARCH_KEYS,
  deepCopy,
  Genre,
  ICleverSearchKeys,
  ISearchStatus,
  ISearchValue,
  LibraryMode,
  Path,
  SearchKeys,
} from '../../models';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { ItemType, LibraryItem } from '@shared/models/library';
import { map, switchMap } from 'rxjs/operators';
import { FileCabService } from '@shared/services/file-cab.service';
import { Tag } from '@shared/models/tag';
import { StatusList } from '@shared/const';

const BASE_STATE: ISearchStatus = {
  search: '',
  options: {
    status: [{ value: StatusList.process, positive: true }],
  },
};

@Injectable()
export class SearchService {
  private status = new BehaviorSubject<ISearchStatus>(BASE_STATE);
  private mode = new BehaviorSubject<LibraryMode>(LibraryMode.library);
  private path$ = new BehaviorSubject<Path | null>(null);
  private page = new BehaviorSubject(1);

  page$ = this.page.asObservable();
  mode$ = this.mode.asObservable();
  status$ = this.status.asObservable();
  searchKeys$: Observable<ICleverSearchKeys>;

  constructor(
    private fileCabService: FileCabService,
  ) {
    this.searchKeys$ = this.createSearchKeys();
  }

  setPath(path: Path): void {
    this.path$.next(path);
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
  }

  setMode(mode: LibraryMode): void {
    this.mode.next(mode);
  }

  filterByState(data: LibraryItem<ItemType>[], state: ISearchStatus, mode: LibraryMode): LibraryItem<ItemType>[] {
    if (state) {
      state.search = state.search && state.search.toLocaleLowerCase();
      const list = data?.filter(item => this.itemToStateCompare(item, state, mode));
      return list;
    } else {
      return data;
    }
  }

  private createSearchKeys(): Observable<ICleverSearchKeys> {
    const genres$ = this.path$.pipe(
      switchMap(path => this.fileCabService.selectGenres(path)),
    );

    return combineLatest([
      this.mode$,
      this.fileCabService.tags$,
      genres$,
    ]).pipe(
      map(([mode, tags, genres]) => this.loadKeys(mode, genres, tags)),
    );
  }

  private itemToStateCompare(item: LibraryItem<ItemType>, state: ISearchStatus, mode: LibraryMode): boolean {
    let isCompare = true;
    if (state.search && mode === LibraryMode.library) {
      isCompare = item.item.title?.toLocaleLowerCase().search(state.search) > -1
        || item.item.original_title?.toLocaleLowerCase().search(state.search) > -1
        || item.name?.toLocaleLowerCase().search(state.search) > -1
      ;
    }

    return isCompare
      && (!Object.keys(state.options).length
        || Object.keys(state.options)
          .map(key => this.checkCompare(key as SearchKeys, state.options[key], item))
          .reduce((prev, next) => prev && next, true));
  }

  private checkCompare(key: SearchKeys, value: ISearchValue[], item: LibraryItem<ItemType>): boolean {
    if (!value[0]) {
      return true;
    }
    const separateSearch = this.separateSearchValue(value);
    switch (key) {
      case SearchKeys.genres:
        const searchResGenres = this.compareList(item.item.genre_ids, separateSearch);
        return searchResGenres.positive.reduce((prev, next) => prev && next, true)
          && searchResGenres.negative.reduce((prev, next) => prev && next, true);

      case SearchKeys.years:
        const searchResYears = this.compareList([item.item.year], separateSearch);
        return searchResYears.positive.reduce((prev, next) => prev || next, false)
          && searchResYears.negative.reduce((prev, next) => prev && next, true);

      case SearchKeys.status:
        const searchResStatus = this.compareList([item.status], separateSearch);
        return searchResStatus.positive.reduce((prev, next) => prev || next, false)
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
    keys.tags.list = tags;

    if (mode === LibraryMode.search) {
      delete keys.status;
      delete keys.ratingFrom;
      delete keys.ratingTo;
      delete keys.tags;
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
