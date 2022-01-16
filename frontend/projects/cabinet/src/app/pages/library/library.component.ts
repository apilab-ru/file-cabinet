import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, filter, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { LibraryService } from '../../services/library.service';
import { ISearchStatus, LibraryItem, LibraryMode, Path } from '../../../models';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { DataFactoryService } from './services/data-factory.service';
import { SearchService } from '../../services/search.service';
import { AddItemComponent } from '../../shared/components/add-item/add-item.component';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { StatusList } from '@shared/const/const';
import { MetaData } from '@server/models/meta-data';
import { MatSnackBar } from '@angular/material/snack-bar';

@UntilDestroy()
@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss'],
  providers: [
    SearchService,
    DataFactoryService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryComponent implements OnInit {
  mode$ = this.searchService.mode$;
  list$: Observable<LibraryItem[]>;
  genres$ = this.dataFactoryService.genres$;
  searchStatus$ = this.searchService.status$;
  page$ = this.searchService.page$;
  searchKeys$ = this.searchService.searchKeys$;
  isLoad$ = new BehaviorSubject(false);
  LibraryMode = LibraryMode;

  private path: Path;

  constructor(
    private activeRoute: ActivatedRoute,
    private libraryService: LibraryService,
    private searchService: SearchService,
    private dataFactoryService: DataFactoryService,
    private matSnackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    this.activeRoute
      .data
      .pipe(untilDestroyed(this))
      .subscribe(data => {
        this.path = data.path;
        this.dataFactoryService.setPath(data.path);
        this.searchService.setPath(data.path);
      });

    this.list$ = combineLatest([
      this.searchService.status$,
      this.searchService.mode$,
    ]).pipe(
      tap(() => this.isLoad$.next(true)),
      switchMap(([status, mode]) => this.selectData(mode, status)),
      catchError(err => {
        this.notification(err.message);
        return of([]);
      }),
      tap(() => this.isLoad$.next(false)),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  updateSearch(status: ISearchStatus): void {
    this.searchService.update(status);
  }

  changeMode(mode: LibraryMode): void {
    this.searchService.setMode(mode);
  }

  onClickGenre(genre: number): void {
    this.searchService.selectGenre(genre);
  }

  updateItem(item: LibraryItem): void {
    this.libraryService.updateItem(this.path, item);
  }

  deleteItem(item: LibraryItem): void {
    this.libraryService.deleteItem(this.path, item.item);
  }

  addItem(libraryItem: LibraryItem): void {
    const dialog = this.dialog.open<void, MetaData, LibraryItem>(AddItemComponent, {
      data: {
        ...libraryItem,
        status: StatusList.planned,
      },
    });
    dialog.afterClosed()
      .pipe(
        take(1),
        filter(metaData => !!metaData),
        switchMap(metaData => this.libraryService.addItem(this.path, {
          ...libraryItem,
          ...metaData,
        })),
        untilDestroyed(this),
      )
      .subscribe(() => {
        this.notification('Сохранено');
      });
  }

  trackBy(index: number, item: LibraryItem): number {
    return item.item.id || item.item.imdbId || item.item.smotretId;
  }

  private selectData(mode: LibraryMode, state: ISearchStatus): Observable<LibraryItem[]> {
    return (mode === LibraryMode.library
      ? this.dataFactoryService.getFromLibrary().pipe(
        map(list => this.searchService.filterByState(list, state, mode)),
      )
      : this.dataFactoryService.search(state));
  }

  private notification(message: string): void {
    this.matSnackBar.open(message, undefined, {
      duration: 2000,
    });
  }
}
