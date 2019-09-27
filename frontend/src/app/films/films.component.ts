import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Destructible } from '../shared/destructible';
import { map, publishReplay, refCount, takeUntil, tap } from 'rxjs/operators';
import { LibraryService } from '../services/library.service';
import { Observable } from 'rxjs';
import { Film, Genre, LibraryItem } from '@cab/api';
import { FilmsService } from '../services/films.service';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-films',
  templateUrl: './films.component.html',
  styleUrls: ['./films.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilmsComponent extends Destructible implements OnInit {

  mode: 'films' | 'tv';
  list: LibraryItem<Film>[];
  genres$ = this.filmsService.getGenres();

  constructor(
    private activeRoute: ActivatedRoute,
    private libraryService: LibraryService,
    private filmsService: FilmsService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.activeRoute
      .data
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.mode = data.mode;
        this.load();
      });
  }

  updateItem(item: LibraryItem<Film>): void {
    this.libraryService.updateItem('films', item.item.id , item);
  }

  deleteItem(item: LibraryItem<Film>): void {
    this.libraryService.deleteItem('films', item.item.id);
  }

  private load(): void {
    this.libraryService.store$
      .pipe(
        map(store => store.data[this.mode] as LibraryItem<Film>[]),
        takeUntil(this.destroy$),
      ).subscribe(list => {
        this.list = list;
      });
  }
}
