import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Destructible } from '../shared/destructible';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { LibraryService } from '../services/library.service';
import { Genre, ISearchStatus, ItemType, LibraryItem, LibraryMode, Path } from '@cab/api';
import { FilmsService } from '../services/films.service';
import { combineLatest, Observable, Subject } from 'rxjs';
import { AnimeService } from '../services/anime.service';
import { DataFactory } from './data-factory';
import { SearchService } from '../services/search.service';
import { AddItemComponent } from '../components/add-item/add-item.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LibraryComponent extends Destructible implements OnInit {

  path: Path;
  list: LibraryItem<ItemType>[];

  dataFactory: DataFactory;

  placeholder = 'assets/placeholder_180x270.jpg';

  get genres$(): Observable<Genre[]> {
    return this.dataFactory && this.dataFactory.genres$;
  }

  get isLibraryMode$(): Observable<boolean> {
    return this.searchService.modeChanges()
      .pipe(map(mode => mode === LibraryMode.library));
  }

  isLoad = false;

  private reload$ = new Subject<void>();

  constructor(
    private activeRoute: ActivatedRoute,
    private libraryService: LibraryService,
    private filmsService: FilmsService,
    private animeService: AnimeService,
    private searchService: SearchService,
    private dialog: MatDialog,
  ) {
    super();
  }

  ngOnInit(): void {
    this.isLoad = true;
    this.activeRoute
      .data
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.path = data.path;
        this.load();
        this.dataFactory = new DataFactory(
          this.animeService,
          this.filmsService,
          this.libraryService,
        ).setPath(this.path);
        this.reload$.next();
      });
  }

  onClickGenre(genre: number): void {
    this.searchService.selectGenre(genre);
  }

  updateItem(item: LibraryItem<ItemType>): void {
    this.libraryService.updateItem(this.path, item.item.id , item);
  }

  deleteItem(item: LibraryItem<ItemType>): void {
    this.libraryService.deleteItem(this.path, item.item.id);
  }

  onSetStars(star: number, item: LibraryItem<ItemType>): void {
    item.star = star;
    this.libraryService.updateItem(this.path, item.item.id , item);
  }

  isShowStars(item: LibraryItem<ItemType>): boolean {
    return item.status === 'complete' || item.status === 'process' || item.status === 'drop';
  }

  addItem(item: LibraryItem<ItemType>): void {
    const dialog = this.dialog.open(AddItemComponent, {
      data: {
        title: item.item.title,
        path: this.path,
      }
    });
    dialog.afterClosed().subscribe(res => {
      this.libraryService.addItem(res.path, {
        item: item.item,
        ...res.param
      }).subscribe(() => {
        this.reload$.next();
      });
    })
  }

  private load(): void {
    combineLatest([
      this.searchService.statusChanges(),
      this.searchService.modeChanges(),
      this.reload$.asObservable(),
    ]).pipe(
      tap(() => this.isLoad = true),
      map(([search, mode]) => ({search, mode})),
      switchMap(({search, mode}) => this.selectData(mode, search)),
    ).subscribe(list => {
      this.list = list;
      this.isLoad = false;
    });
  }

  private selectData(mode: LibraryMode, state: ISearchStatus): Observable<LibraryItem<ItemType>[]> {
    return (mode === LibraryMode.library
      ? this.dataFactory.getFromLibrary()
      : this.dataFactory.search(state))
      .pipe(
        map(list => this.searchService.filterByState(list, state)),
      );
  }
}
