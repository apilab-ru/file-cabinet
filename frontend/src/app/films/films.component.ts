import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Destructible } from '../shared/destructible';
import { map, takeUntil, tap } from 'rxjs/operators';
import { LibraryService } from '../services/library.service';
import { Observable } from 'rxjs';
import { Film, Genre, LibraryItem } from '@cab/api';
import { FilmsService } from '../services/films.service';

@Component({
  selector: 'app-films',
  templateUrl: './films.component.html',
  styleUrls: ['./films.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilmsComponent extends Destructible implements OnInit {

  mode: 'films' | 'tv';

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
      .subscribe(data => this.mode = data.mode);
  }

  get genres$(): Observable<Genre[]> {
    return this.filmsService.getGenres();
  }

  get list$(): Observable<LibraryItem<Film>[]> {
    return this.libraryService.store$
      .pipe(
        tap(store => console.log('store', store)),
        map(store => store.data[this.mode] as LibraryItem<Film>[]),
        tap(list => console.log('list', list))
      );
  }

  updateItem(item: LibraryItem<Film>): void {
    console.log('update item', item);
  }

  deleteItem(item: LibraryItem<Film>): void {
    this.libraryService.deleteItem('films', item.item.id);
  }

}
