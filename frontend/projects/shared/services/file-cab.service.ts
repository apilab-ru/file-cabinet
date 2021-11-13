import { Injectable, NgZone } from '@angular/core';
import { FileCab } from '@shared/services/file-cab';
import { from, Observable } from 'rxjs';
import { map, pluck } from 'rxjs/operators';
import { ISchema, ItemType, Library, LibraryItem } from '@shared/models/library';
import { runInZone } from '@shared/utils/run-in-zone';
import { NavigationItem } from '@shared/models/navigation';
import { Genre, SearchRequestResult } from '@server/api/base';
import { MetaData } from '@shared/models/meta-data';
import { Tag } from '@shared/models/tag';

@Injectable({
  providedIn: 'root',
})
export class FileCabService {
  schemas$: Observable<Record<string, ISchema>>;
  types$: Observable<NavigationItem[]>;
  animeGenres$: Observable<Genre[]>;
  filmGenres$: Observable<Genre[]>;

  data$: Observable<Record<string, LibraryItem<ItemType>[]>>;
  tags$: Observable<Tag[]>;
  store$: Observable<Library>;

  private fileCab: FileCab;

  constructor(
    private ngZone: NgZone,
  ) {
    this.fileCab = window.chrome.extension.getBackgroundPage()['fileCab'];

    this.schemas$ = this.fileCab.config$.pipe(
      map(({ schemas }) => schemas),
      runInZone(this.ngZone),
    );
    this.types$ = this.fileCab.config$.pipe(
      map(({ types }) => types),
      runInZone(this.ngZone),
    );
    this.animeGenres$ = this.fileCab.animeGenres$;
    this.filmGenres$ = this.fileCab.filmGenres$;
    this.data$ = this.fileCab.store$.pipe(
      pluck('data'),
      runInZone(this.ngZone),
    );
    this.tags$ = this.fileCab.store$.pipe(
      pluck('tags'),
      runInZone(this.ngZone),
    );

    this.store$ = this.fileCab.store$.pipe(
      runInZone(this.ngZone),
    );
  }

  selectGenres(type: string): Observable<Genre[]> {
    return this.fileCab.selectGenres(type).pipe(
      runInZone(this.ngZone),
    );
  }

  searchInStore(
    path: string,
    name: string,
    url?: string,
  ): Observable<LibraryItem<ItemType> | null> {
    return this.fileCab.searchInStore(path, name, url).pipe(
      runInZone(this.ngZone),
    );
  }

  addOrUpdate(path: string, item: ItemType, metaData: MetaData): Observable<LibraryItem<ItemType>> {
    return this.fileCab.addOrUpdate(path, item, metaData).pipe(
      runInZone(this.ngZone),
    );
  }

  // TODO refactoring to observable
  addItemLibToStore(path: string, item: LibraryItem<ItemType>): Observable<void> {
    return from(this.fileCab.addItemLibToStore(path, item)).pipe(
      runInZone(this.ngZone),
    );
  }

  searchApi(path: string, name: string): Observable<SearchRequestResult<ItemType>> {
    return this.fileCab.searchApi(path, name).pipe(
      runInZone(this.ngZone),
    );
  }

  addItemOld(path: string, name: string, param: MetaData): Observable<ItemType> {
    return from(this.fileCab.addItemOld(path, name, param)).pipe(
      runInZone(this.ngZone),
    );
  }

  deleteItem(path: string, id: number): void {
    return this.fileCab.deleteItem(path, id);
  }

  updateItem(path: string, id: number, item): LibraryItem<ItemType> {
    return this.fileCab.updateItem(path, id, item);
  }
}
