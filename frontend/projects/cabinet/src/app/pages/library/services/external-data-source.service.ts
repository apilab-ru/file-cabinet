import { Injectable } from '@angular/core';
import { DataSourceService } from './data-source.service';
import { ISearchStatus, LibraryItem, MediaItem, Path, SearchRequestResult } from '../../../../models';
import { AnimeService } from '../../../services/anime.service';
import { FilmsService } from '../../../services/films.service';
import { combineLatest, Observable, of } from 'rxjs';
import { catchError, debounceTime, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { SearchService } from './search.service';
import { LibraryService } from '../../../services/library.service';
import { DataSourceFormService } from './data-source-form.service';
import { itemCompare } from '@shared/utils/item-compare';

@Injectable()
export class ExternalDataSourceService extends DataSourceService<LibraryItem> {
  constructor(
    private animeService: AnimeService,
    private filmsService: FilmsService,
    private searchService: SearchService,
    private libraryService: LibraryService,
    private formService: DataSourceFormService,
  ) {
    super();
    this.list$ = this.makeList();
  }

  private makeList(): Observable<LibraryItem[]> {
    return combineLatest([
      this.searchService.path$,
      this.searchService.status$,
      this.formService.page$,
      this.formService.limit$,
    ]).pipe(
      debounceTime(10),
      tap(() => {
        this.state.loading.next(true);
      }),
      switchMap(([path, status, page, limit]) => combineLatest([
        this.getFromLibrary(),
        this.load(path, status, page, limit),
      ]).pipe(
        tap(([, result]) => {
          this.state.loading.next(false);
          this.state.total.next(result.total_results || null);
          this.state.hasMore.next(result.results.length === limit);
        }),
      )),
      map(([library, result]) => {
        const list = this.factoryItems(result);
        return this.mathWithLibrary(list, library);
      }),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private load(path: Path | null, state: ISearchStatus | undefined, page: number, limit: number): Observable<SearchRequestResult<MediaItem>> {
    const EMPTY = {
      page,
      results: [],
    } as SearchRequestResult<MediaItem>;

    switch (path) {
      case Path.tv:
        return this.filmsService.findTv({
          name: state?.search,
          page,
          limit,
        }).pipe(
          catchError(() => of(EMPTY)),
        );

      case Path.films:
        return this.filmsService.findMovie({
          name: state?.search,
          page,
          limit,
        }).pipe(
          catchError(() => of(EMPTY)),
        );

      case Path.anime:
        return this.animeService.findAnime({
          name: state?.search,
          page,
          limit,
        }).pipe(
          catchError(() => of(EMPTY)),
        );

      default:
        return of(EMPTY);
    }
  }

  private mathWithLibrary(list: LibraryItem[], library: LibraryItem[]): LibraryItem[] {
    return list.map(item => {
      const founded = library.find(it => itemCompare(it, item));

      return founded
        ? { ...founded, founded: true }
        : { ...item, founded: false };
    });
  }


  private factoryItems(result: SearchRequestResult<MediaItem>): LibraryItem[] {
    return result.results.map(item => ({ item }));
  }

  private getFromLibrary(): Observable<LibraryItem[]> {
    return combineLatest([
      this.searchService.path$,
      this.libraryService.data$,
    ]).pipe(
      map(([path, data]) => data[path] || []),
    );
  }

}
