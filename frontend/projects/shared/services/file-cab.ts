import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { deepCopy, Genre, NavigationItem, SearchRequestResult } from '../../cabinet/src/models';
import { catchError, map, shareReplay, take } from 'rxjs/operators';
import { fileCabApi } from './file-cab.api';
import { MetaData } from '@shared/models/meta-data';
import { ISchema, ItemType, Library, LibraryItem, LibrarySettings } from '@shared/models/library';
import { Tag } from '@shared/models/tag';
import { PARSER_TYPES, TYPES } from '../models/const';
import { ChromeStoreApi } from '@shared/services/chrome-store.api';

const configData = {
  schemas: {} as Record<string, ISchema>,
  types: [] as NavigationItem[],
};

const storeData = {
  tags: [] as Tag[],
  data: {} as Record<string, LibraryItem<ItemType>[]>,
  settings: {} as LibrarySettings,
};

export class FileCab {
  private store = new BehaviorSubject<Library>(storeData);
  private config = new BehaviorSubject<typeof configData>(this.init());
  private storeApi = new ChromeStoreApi();

  config$: Observable<typeof configData>;
  store$: Observable<typeof storeData> = this.store.asObservable();
  filmGenres$: Observable<Genre[]>;
  animeGenres$: Observable<Genre[]>;

  constructor() {
    this.config$ = this.config.asObservable().pipe(
      shareReplay(1),
    );

    this.config$.subscribe();

    this.loadStore().pipe(
      take(1),
    ).subscribe(store => this.updateStore(store));

    this.filmGenres$ = fileCabApi.loadFilmGenres().pipe(
      shareReplay(1),
    );
    this.animeGenres$ = fileCabApi.loadAnimeGenres().pipe(
      shareReplay(1),
    );

    this.store$.subscribe(store => console.log('xxx store', store));

    /*this.storeApi.onStoreChanges().subscribe(res => {
      console.log('xxx store change', res);
    })*/
  }

  selectGenres(type: string): Observable<Genre[]> {
    return type === 'anime' ? this.animeGenres$ : this.filmGenres$;
  }

  searchInStore(
    path: string,
    name: string,
    url?: string,
  ): Observable<LibraryItem<ItemType> | null> {
    return this.store$.pipe(
      map(store => store.data && store.data[path] || []),
      map(list => list.find(
        item => item.item.title === name || item.url === url || item.name === name,
      ) || null),
    );
  }

  searchApi(path: string, name: string): Observable<SearchRequestResult<ItemType>> {
    switch (path) {
      case 'anime':
        return fileCabApi.searchAnime(name);

      case 'films':
        return fileCabApi.searchFilm(name);

      case 'tv':
        return fileCabApi.searchTv(name);

      default:
        return throwError(`path ${name} not support`);
    }
  }

  addItemLibToStore(path: string, item: LibraryItem<ItemType>): Promise<void> {
    return this.checkUnique(path, item.item)
      .then(() => {
        const meta = deepCopy(item);
        delete meta.item;

        this.addItemToStore(path, item.item, meta);
      });
  }

  addOrUpdate(path: string, item: ItemType, metaData: MetaData): Observable<LibraryItem<ItemType>> {
    return this.checkExisted(path, item).pipe(
      map(isExisted => isExisted ? this.updateItem(path, item.id, {
        ...metaData,
        item,
      }) : this.addItemToStore(path, item, metaData)),
    );
  }

  checkExisted(path: string, item: ItemType): Observable<boolean> {
    return this.store.asObservable().pipe(
      map(store => store.data && store.data[path] || []),
      take(1),
      map(list => !!list.find(it => it.item.id === item.id)),
    );
  }

  addItemToStore(path: string, item: ItemType, param: MetaData): LibraryItem<ItemType> {
    const data = deepCopy(this.store.getValue().data);

    if (!data[path]) {
      data[path] = [];
    }

    const itemRes = {
      item,
      ...param,
    };

    data[path].push(itemRes);

    this.updateStore({
      ...this.store.getValue(),
      data,
    });

    return itemRes;
  }

  checkUnique(path, item): Promise<ItemType> {
    const { data } = this.store.getValue();

    if (data[path]) {
      const founded = data[path].find(it => it.item.id === item.id);
      if (founded) {
        return Promise.reject({ code: 'notUnique', item: founded });
      }
    }
    return Promise.resolve(item);
  }


  updateItem(path: string, id: number, item: LibraryItem<ItemType>): LibraryItem<ItemType> {
    const { data } = deepCopy(this.store.getValue());

    if (!data[path]) {
      data[path] = [];
    }

    const index = data[path].findIndex(it => it.item.id === id);
    data[path][index] = item;

    this.updateStore({ ...this.store.getValue(), data });

    return item;
  }

  deleteItem(path: string, id: number): void {
    const { data } = deepCopy(this.store.getValue());

    if (!data[path]) {
      return;
    }

    const index = data[path].findIndex(it => it.item.id === id);
    if (index !== -1) {
      data[path].splice(index, 1);
      this.updateStore({ ...this.store.getValue(), data });
    }
  }

  updateStore(store: Library): void {
    this.store.next(store);
    this.storeApi.setStore(store);
  }

  private loadStore(): Observable<Library> {
    return this.storeApi.getStore<Library>().pipe(
      map(store => {

        if (!store) {
          store = {
            tags: [],
            data: {},
            settings: {},
          };
        }

        if (!store.settings) {
          store.settings = {};
        }

        if (!store.data) {
          store.data = {};
        }

        if (!store.tags) {
          store.tags = [];
        }

        return store;
      }),
      catchError(() => {
        return of({
          tags: [],
          data: {},
          settings: {},
        });
      }),
    );
  }

  private init(): typeof configData {
    return {
      schemas: PARSER_TYPES,
      types: TYPES,
    };
  }

}
