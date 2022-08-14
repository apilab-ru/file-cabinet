import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, shareReplay, switchMap, take } from 'rxjs/operators';
import { LibraryService } from '../../services/library.service';
import { ISearchStatus, LibraryItem, LibraryMode, Path } from '../../../models';
import { Observable } from 'rxjs';
import { DataFactoryService } from './services/data-factory.service';
import { SearchService } from './services/search.service';
import { AddItemComponent } from '../../shared/components/add-item/add-item.component';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { StatusList } from '@shared/const/const';
import { MetaData } from '@server/models/meta-data';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocalDataSourceService } from './services/local-data-source.service';
import { ExternalDataSourceService } from './services/external-data-source.service';
import { DataSourceFormService } from './services/data-source-form.service';

@UntilDestroy()
@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss'],
  providers: [
    SearchService,
    DataFactoryService,
    LocalDataSourceService,
    ExternalDataSourceService,
    DataSourceFormService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryComponent implements OnInit {
  mode$ = this.searchService.mode$;
  list$: Observable<LibraryItem[]>;
  genres$ = this.searchService.genres$;

  searchStatus$ = this.searchService.status$;
  searchKeys$ = this.searchService.searchKeys$;
  state$ = this.dataFactoryService.state$;

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
        this.searchService.setPath(data.path);
      });

    this.list$ = this.dataFactoryService.list$.pipe(
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

  onPageChange(page: number): void {
    this.searchService.setPage(page);
  }

  private notification(message: string): void {
    this.matSnackBar.open(message, undefined, {
      duration: 2000,
    });
  }
}
