import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { AnimeService } from '../../../services/anime.service';
import { FilmsService } from '../../../services/films.service';
import { Genre, ISearchStatus, Path, SearchRequestResult } from '../../../../models';
import { catchError, map, switchMap } from 'rxjs/operators';
import { LibraryService } from '../../../services/library.service';
import { ItemType, LibraryItem } from '@shared/models/library';
import { Injectable } from '@angular/core';

@Injectable()
export class DataFactoryService {
  genres$: Observable<Genre[]>;

  private path$ = new BehaviorSubject<Path | null>(null);

  constructor(
    private animeService: AnimeService,
    private filmsService: FilmsService,
    private libraryService: LibraryService,
  ) {
    this.genres$ = this.path$.pipe(
      switchMap(path => this.getGenresByType(path)),
    );
  }

  setPath(path: Path): void {
    this.path$.next(path);
  }

  getFromLibrary(): Observable<LibraryItem<ItemType>[]> {
    return combineLatest([
      this.path$,
      this.libraryService.data$,
    ]).pipe(
      map(([path, data]) => data[path] || []),
    );
  }

  search(state: ISearchStatus): Observable<LibraryItem<ItemType>[]> {
    return combineLatest([
      this.getFromLibrary(),
      this.path$.pipe(switchMap(path => this.load(path, state))),
    ]).pipe(
      map(([library, list]) => {
        return list.map(item => {
          const founded = library.find(it => it.item.id === item.item.id);
          return founded
            ? { ...founded, founded: true }
            : { ...item, founded: false };
        });
      }),
    );
  }

  private load(path: Path | null, state?: ISearchStatus): Observable<LibraryItem<ItemType>[]> {
    switch (path) {
      case Path.tv:
        return this.filmsService.findTv(state?.search).pipe(
          map(this.factoryItems),
          catchError(() => of([])),
        );

      case Path.films:
        return this.filmsService.findMovie(state?.search).pipe(
          map(this.factoryItems),
          catchError(() => of([])),
        );

      case Path.anime:
        return this.animeService.findAnime(state?.search).pipe(
          map(this.factoryItems),
          catchError(() => of([])),
        );

      default:
        return of([]);
    }
  }

  private factoryItems(result: SearchRequestResult<ItemType>): LibraryItem<ItemType>[] {
    return result.results.map(item => ({ item }));
  }

  private getGenresByType(type: Path): Observable<Genre[]> {
    switch (type) {
      case Path.anime:
        return this.animeService.genres$;

      case Path.films:
      case Path.tv:
        return this.filmsService.genres$;

      default:
        return of([]);
    }
  }
}
