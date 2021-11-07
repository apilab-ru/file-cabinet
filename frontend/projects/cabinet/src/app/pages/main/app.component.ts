import { Component, HostBinding, OnInit, ViewEncapsulation } from '@angular/core';
import { filter, first, map, switchMap } from 'rxjs/operators';
import { FilmsService } from '../../services/films.service';
import { AnimeService } from '../../services/anime.service';
import { NavigationService } from '../../services/navigation.service';
import { LibraryService } from '../../services/library.service';
import { combineLatest, Observable } from 'rxjs';
import {
  BASE_CLEVER_SEARCH_KEYS,
  deepCopy,
  ICleverSearchKeys,
  ISearchStatus,
  LibraryMode,
  Path,
} from '../../../models';
import { SearchService } from '../../services/search.service';
import { NavigationEnd, Router } from '@angular/router';
import { DataFactory } from '../../services/data-factory';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {

  readonly navLinks$ = this.navigationService.getItems();

  @HostBinding('class.app') isMainClass = true;

  searchKeys: ICleverSearchKeys = deepCopy(BASE_CLEVER_SEARCH_KEYS);

  private dataFactory: DataFactory;

  constructor(
    private filmsService: FilmsService,
    private animeService: AnimeService,
    private navigationService: NavigationService,
    private libraryService: LibraryService,
    private searchService: SearchService,
    private router: Router,
  ) {
    this.dataFactory = new DataFactory(
      this.animeService,
      this.filmsService,
      this.libraryService,
    );
  }

  get searchStatus$(): Observable<ISearchStatus> {
    return this.searchService.statusChanges();
  }

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const item = this.router.config.find(it => it.path === event.url.substr(1));
        this.navigationService.setPath(item.path);
      });

    let lastMode: LibraryMode;
    combineLatest(
      this.navigationService.path$,
      this.searchService.modeChanges(),
    ).pipe(
      map(([path, mode]) => ({ path, mode })),
      switchMap(({ path, mode }) => combineLatest(
        this.libraryService.store$.pipe(map(store => store.tags)),
        this.loadKeys(path as Path, mode),
        ).pipe(map(([tags, set]) => ({ tags, set, path, mode }))),
      ),
    ).subscribe(({ tags, set, path, mode }) => {
      if (set.tags) {
        set.tags.list = tags;
      }
      this.searchKeys = set;
      if (lastMode !== mode && mode === LibraryMode.library) {
        this.searchService.statusChanges()
          .pipe(first())
          .subscribe(state => this.searchService.update(
            {
              ...state,
              options: {
                ...state.options,
                status: [{positive: true, value: 'planned'}]
              },
            },
            ),
          );
      }
    });
  }

  updateSearch(status: ISearchStatus): void {
    this.searchService.update(status);
  }

  modeChanges(): Observable<LibraryMode> {
    return this.searchService.modeChanges();
  }

  changeMode(mode: LibraryMode): void {
    this.searchService.setMode(mode);
  }

  private loadKeys(path: Path, mode: LibraryMode): Observable<ICleverSearchKeys> {
    this.dataFactory.setPath(path);
    return this.dataFactory.genres$.pipe(
      map(genres => {
        const set = deepCopy(BASE_CLEVER_SEARCH_KEYS);
        set.genres.list = genres;
        if (mode === LibraryMode.search) {
          delete set.status;
          delete set.ratingFrom;
          delete set.ratingTo;
          delete set.tags;
        }
        return set;
      }),
    );
  }

}
