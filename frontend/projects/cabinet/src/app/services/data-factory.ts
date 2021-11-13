import { forkJoin, Observable, of } from 'rxjs';
import { AnimeService } from './anime.service';
import { FilmsService } from './films.service';
import { Genre, ISearchStatus, Path, SearchRequestResult } from '../../models';
import { catchError, map, take } from 'rxjs/operators';
import { LibraryService } from './library.service';
import { ItemType, LibraryItem } from '@shared/models/library';

export class DataFactory {
  genres$: Observable<Genre[]>;

  private path: Path;

  constructor(
    private animeService: AnimeService,
    private filmsService: FilmsService,
    private libraryService: LibraryService,
  ) {
  }

  setPath(path: Path): this {
    this.path = path;
    switch (path) {
      case Path.tv:
        this.initTv();
        break;

      case Path.films:
        this.initFilms();
        break;

      case Path.anime:
        this.initAnime();
        break;

      default:
        this.genres$ = of([]);
        break;
    }
    return this;
  }

  getFromLibrary(): Observable<LibraryItem<ItemType>[]> {
    return this.libraryService.data$.pipe(
      map(data => data[this.path] as LibraryItem<ItemType>[]),
    );
  }

  search(state: ISearchStatus): Observable<LibraryItem<ItemType>[]> {
    return forkJoin(
      this.getFromLibrary().pipe(take(1)),
      this.load(state).pipe(
        map(this.factoryItems),
        catchError(() => of([])),
      ),
    ).pipe(
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

  private load(state?: ISearchStatus): Observable<SearchRequestResult<ItemType>> {
    switch (this.path) {
      case Path.tv:
        return this.filmsService.findTv(state && state.search);

      case Path.films:
        return this.filmsService.findMovie(state && state.search);

      case Path.anime:
        return this.animeService.findAnime(state && state.search);
    }
  }

  private factoryItems(result: SearchRequestResult<ItemType>): LibraryItem<ItemType>[] {
    return result.results.map(item => ({
      item,
    }));
  }

  private initTv() {
    this.genres$ = this.filmsService.genres$;
  }

  private initFilms() {
    this.genres$ = this.filmsService.genres$;
  }

  private initAnime() {
    this.genres$ = this.animeService.genres$;
  }

}
