import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { AnimeService } from '../../../services/anime.service';
import { FilmsService } from '../../../services/films.service';
import { ISearchStatus, LibraryItem, MediaItem, Path, SearchRequestResult } from '../../../../models';
import { catchError, map, switchMap } from 'rxjs/operators';
import { LibraryService } from '../../../services/library.service';
import { Injectable } from '@angular/core';
import { Genre } from '@server/models/genre';
import { FileCabService } from '@shared/services/file-cab.service';
import { GenreKind } from '../../../../../../../../server/src/genres/const';

@Injectable()
export class DataFactoryService {
  genres$: Observable<Genre[]>;

  private path$ = new BehaviorSubject<Path | null>(null);

  constructor(
    private animeService: AnimeService,
    private filmsService: FilmsService,
    private libraryService: LibraryService,
    private fileCabService: FileCabService,
  ) {
    this.genres$ = this.path$.pipe(
      switchMap(path => this.getGenresByType(path)),
    );
  }

  setPath(path: Path): void {
    this.path$.next(path);
  }

  getFromLibrary(): Observable<LibraryItem[]> {
    return combineLatest([
      this.path$,
      this.libraryService.data$,
    ]).pipe(
      map(([path, data]) => data[path] || []),
    );
  }

  search(state: ISearchStatus): Observable<LibraryItem[]> {
    return combineLatest([
      this.getFromLibrary(),
      this.path$.pipe(switchMap(path => this.load(path, state))),
      this.path$,
    ]).pipe(
      map(([library, list, path]) => {
        return list.map(item => {
          const founded = library.find(it => it.item.id === item.item.id);
          return founded
            ? { ...founded, founded: true }
            : { ...item, founded: false };
        });
      }),
    );
  }

  private load(path: Path | null, state?: ISearchStatus): Observable<LibraryItem[]> {
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

  private factoryItems(result: SearchRequestResult<MediaItem>): LibraryItem[] {
    return result.results.map(item => ({ item }));
  }

  private getGenresByType(type: Path): Observable<Genre[]> {
    return this.fileCabService.genres$.pipe(
      map(list => list.filter(it => it.kind.includes(type as undefined as GenreKind))),
    );
  }
}
