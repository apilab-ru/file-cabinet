import { forkJoin, Observable } from 'rxjs';
import { AnimeService } from '../services/anime.service';
import { FilmsService } from '../services/films.service';
import { ISearchStatus, ItemType, LibraryItem, Path, Genre, SearchRequestResult } from '../../api';
import { map, take } from 'rxjs/operators';
import { LibraryService } from '../services/library.service';

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
    }
    return this;
  }

  getFromLibrary(): Observable<LibraryItem<ItemType>[]> {
    return this.libraryService.store$.pipe(
      map(store => store.data[this.path] as LibraryItem<ItemType>[]),
    );
  }

  search(state: ISearchStatus): Observable<LibraryItem<ItemType>[]> {
    return forkJoin(
      this.getFromLibrary().pipe(take(1)),
      this.load(state),
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

  load(state?: ISearchStatus): Observable<LibraryItem<ItemType>[]> {
    switch(this.path) {
      case Path.tv:
        return this.filmsService.findTv(state && state.search).pipe(map(this.factoryItems));

      case Path.films:
        return this.filmsService.findMovie(state && state.search).pipe(map(this.factoryItems));

      case Path.anime:
        return this.animeService.findAnime(state && state.search).pipe(map(this.factoryItems));
    }
  }

  private factoryItems(result: SearchRequestResult<ItemType>): LibraryItem<ItemType>[] {
    return result.results.map(item => ({
      item
    }))
  }

  private initTv() {
    this.genres$ = this.filmsService.getGenres();
  }

  private initFilms() {
    this.genres$ = this.filmsService.getGenres();
  }

  private initAnime() {
    this.genres$ = this.animeService.getGenres();
  }

}
