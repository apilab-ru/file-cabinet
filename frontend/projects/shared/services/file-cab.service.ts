import { Injectable, NgZone } from '@angular/core';
import { FileCab, ItemParam } from '@shared/services/file-cab';
import { from, Observable, of } from 'rxjs';
import { map, pluck, take } from 'rxjs/operators';
import { ISchema, Library, LibrarySettings } from '@shared/models/library';
import { runInZone } from '@shared/utils/run-in-zone';
import { NavigationItem } from '@shared/models/navigation';
import { SearchRequestResult } from '@server/models/base';
import { MetaData } from '@server/models/meta-data';
import { Tag } from '@shared/models/tag';
import { LibraryItem, MediaItem } from '@server/models';
import { Genre } from '@server/models/genre';
import { GenreKind } from '../../../../server/src/genres/const';

interface FlatLibraryItem extends LibraryItem {
  type: string;
}

interface SearchResult {
  type: string;
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class FileCabService {
  schemas$: Observable<Record<string, ISchema>>;
  types$: Observable<NavigationItem[]>;
  genres$: Observable<Genre[]>;

  data$: Observable<Record<string, LibraryItem[]>>;
  tags$: Observable<Tag[]>;
  store$: Observable<Library>;
  settings$: Observable<LibrarySettings>;

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
    this.genres$ = this.fileCab.genres$;

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
    this.settings$ = this.fileCab.settings$.pipe(
      runInZone(this.ngZone),
    );
  }

  updateSettings(settings: LibrarySettings): void {
    return this.fileCab.updateSettings(settings);
  }

  searchByName(name: string, type?: string): Observable<SearchResult | null> {
    return this.data$.pipe(
      take(1),
      map(store => {
        const list = this.flatStore(store, type);
        const item = list.find(it => it.name?.includes(name)
          || it.item.originalTitle?.includes(name)
          || it.item.title?.includes(name),
        );

        if (item) {
          return {
            type: item.type,
            id: item.item.id,
            name: item.name || item.item.title,
          };
        }

        return null;
      }),
    );
  }

  searchByUrl(url: string, type?: string): Observable<SearchResult | null> {
    return this.data$.pipe(
      take(1),
      map(store => {
        const list = this.flatStore(store, type);
        const item = list.find(it => it.url === url);

        if (item) {
          return {
            type: item.type,
            id: item.item.id,
            name: item.name || item.item.title,
          };
        }

        return null;
      }),
    );
  }

  selectGenres(type: string): Observable<Genre[]> {
    return this.fileCab.genres$.pipe(
      map(list => list.filter(genre => genre.kind.includes(type as GenreKind))),
      runInZone(this.ngZone),
    );
  }

  searchInStore(
    path: string,
    item: ItemParam,
  ): Observable<LibraryItem | null> {
    return this.fileCab.searchInStore(path, item).pipe(
      runInZone(this.ngZone),
    );
  }

  checkExisted(path: string, item: ItemParam): Observable<boolean> {
    return this.fileCab.checkExisted(path, item).pipe(
      take(1),
      runInZone(this.ngZone),
    );
  }

  private flatStore(store: Record<string, LibraryItem[]>, type: string): FlatLibraryItem[] {
    return Object.entries(store)
      .sort(([pathA], [pathB]) => (pathB === type ? 1 : 0) - (pathA === type ? 1 : 0))
      .reduce((all, [type, list]) => ([
        ...all, ...list.map(item => ({ ...item, type })),
      ]), []);
  }

  addOrUpdate(path: string, item: MediaItem, metaData: MetaData): Observable<LibraryItem> {
    return this.fileCab.addOrUpdate(path, item, metaData).pipe(
      runInZone(this.ngZone),
    );
  }

  addItemLibToStore(path: string, item: LibraryItem): Observable<void> {
    return from(this.fileCab.addItemLibToStore(path, item)).pipe(
      runInZone(this.ngZone),
    );
  }

  searchApi(path: string | undefined, name: string): Observable<SearchRequestResult<MediaItem>> {
    return !path ? of({
      page: 1,
      total_pages: 1,
      total_results: 0,
      results: [],
    }) : this.fileCab.searchApi(path, name).pipe(
      runInZone(this.ngZone),
    );
  }

  loadById(path: string, id: number): Observable<MediaItem> {
    return this.fileCab.loadById(path, id).pipe(
      runInZone(this.ngZone),
    );
  }

  deleteItem(path: string, item: MediaItem): void {
    return this.fileCab.deleteItem(path, item);
  }

  updateItem(path: string, item: LibraryItem): LibraryItem {
    return this.fileCab.updateItem(path, item);
  }

  updateStore(store: Library): void {
    return this.fileCab.updateStore(store);
  }

  sendUpdateStoreEvent(): void {
    this.fileCab.sendUpdate();
  }

  sendLoadStoreEvent(): void {
    this.fileCab.sendLoadStore();
  }
}
