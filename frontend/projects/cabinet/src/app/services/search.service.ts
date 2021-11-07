import { Injectable } from '@angular/core';
import { ISearchStatus, ISearchValue, ItemType, LibraryItem, LibraryMode, SearchKeys } from '../../models';
import { BehaviorSubject, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

const BASE_STATE: ISearchStatus = {
  search: '',
  options: {
    status: [{ value: 'planned', positive: true }],
  },
};

@Injectable({
  providedIn: 'root',
})
export class SearchService {

  private status$ = new BehaviorSubject<ISearchStatus>(BASE_STATE);
  private mode$ = new BehaviorSubject<LibraryMode>(LibraryMode.library);

  selectGenre(genre: number): void {
    const status = this.status$.getValue() || { options: {}, search: '' };
    this.status$.next({
      ...status,
      options: {
        ...status.options,
        genres: [{ positive: true, value: genre }],
      },
    });
  }

  update(status: ISearchStatus): void {
    this.status$.next(status);
  }

  statusChanges(): Observable<ISearchStatus> {
    return this.status$.asObservable();
  }

  modeChanges(): Observable<LibraryMode> {
    return this.mode$.asObservable().pipe(shareReplay(1));
  }

  setMode(mode: LibraryMode): void {
    console.log('set mode', mode);
    this.mode$.next(mode);
  }

  filterByState(data: LibraryItem<ItemType>[], state: ISearchStatus): LibraryItem<ItemType>[] {
    if (state) {
      state.search = state.search && state.search.toLocaleLowerCase();
      return data?.filter(item => this.itemToStateCompare(item, state));
    } else {
      return data;
    }
  }

  itemToStateCompare(item: LibraryItem<ItemType>, state: ISearchStatus): boolean {
    let isCompare = true;
    if (state.search) {
      isCompare = item.item.title.toLocaleLowerCase().search(state.search) > -1;
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

  compareList(itemValue: (string | number)[], searchSeparate: ISearchValueSeparate): ICompareList {
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
}

interface ISearchValueSeparate {
  positive: ISearchValue[];
  negative: ISearchValue[];
}

interface ICompareList {
  positive: boolean[];
  negative: boolean[];
}
