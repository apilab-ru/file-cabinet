import { BehaviorSubject, from, Observable, throwError } from 'rxjs';
import { deepCopy, Genre, NavigationItem, SearchRequestResult } from '../../cabinet/src/models';
import { map, pluck, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { fileCabApi } from './file-cab.api';
import { MetaData } from '@shared/models/meta-data';
import { ISchema, ItemType, LibraryItem } from '@shared/models/library';
import { Tag } from '@shared/models/tag';

const keyStore = 'store';

const configData = {
  schemas: {} as Record<string, ISchema>,
  types: [] as NavigationItem[],
};

const storeData = {
  tags: [] as Tag[],
  data: {} as Record<string, LibraryItem<ItemType>[]>,
};

export class FileCab {
  private store = new BehaviorSubject<typeof storeData>(storeData);
  private config = new BehaviorSubject<typeof configData>(configData);

  config$: Observable<typeof configData>;
  store$: Observable<typeof storeData> = this.store.asObservable();
  filmGenres$: Observable<Genre[]>;
  animeGenres$: Observable<Genre[]>;

  constructor() {
    this.config$ = from(this.init()).pipe(
      tap(data => this.config.next(data)),
      switchMap(() => this.config.asObservable()),
      shareReplay(1),
    );

    this.config$.subscribe();

    this.updateStore(this.loadStore());
    this.listenChangeStore();
    this.filmGenres$ = fileCabApi.loadFilmGenres().pipe(
      shareReplay(1),
    );
    this.animeGenres$ = fileCabApi.loadAnimeGenres().pipe(
      shareReplay(1),
    );
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
      pluck('data', path),
      map(list => list?.find(
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

  reload(): Promise<typeof configData> {
    return this.init().then(res => {
      this.config.next(res);
      return res;
    });
  }

  addItemOld(path: string, name: string, param: MetaData): Promise<ItemType> {
    return this.searchApi(path, name).toPromise()
      .then(res => this.checkResults(res))
      .then(item => this.checkUnique(path, item))
      .then(item => {
        this.addItemToStore(path, item, param);
        return item;
      });
  }

  addItemLibToStore(path: string, item: LibraryItem<ItemType>): Promise<void> {
    return this.checkUnique(path, item.item)
      .then(() => {
        const meta = deepCopy(item);
        delete meta.item;

        this.addItemToStore(path, item.item, meta);
      });
  }

  addOrUpdate(path: string, item: ItemType, metaData: MetaData): Observable<void> {
    return this.checkExisted(path, item).pipe(
      map(isExisted => isExisted ? this.updateItem(path, item.id, {
        ...metaData,
        item,
      }) : this.addItemToStore(path, item, metaData)),
      tap(isExisted => console.log(
        'xxx save',
        isExisted,
        this.store.getValue(),
      )),
    );
  }

  checkExisted(path: string, item: ItemType): Observable<boolean> {
    return this.store.asObservable().pipe(
      pluck('data', path),
      take(1),
      map(list => !!list.find(it => it.item.id === item.id)),
    );
  }

  addItemToStore(path: string, item: ItemType, param: MetaData): void {
    const data = deepCopy(this.store.getValue().data);

    if (!data[path]) {
      data[path] = [];
    }

    data[path].push({
      item,
      ...param,
    });

    this.updateStore({
      ...this.store.getValue(),
      data,
    });

    console.log('xxx update store', this.store.getValue());
  }

  checkResults(res: SearchRequestResult<ItemType>) {
    if (res.total_results === 1) {
      return Promise.resolve(res.results[0]);
    } else {
      /*if (!this.popup) {
        console.error('popup null', this);
        return Promise.reject({ code: 'popupNull' });
      }
      return this.popup.showModal(res.results);*/
    }
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


  updateItem(path: string, id: number, item: LibraryItem<ItemType>): void {
    const { data } = deepCopy(this.store.getValue());

    if (!data[path]) {
      data[path] = [];
    }

    const index = data[path].findIndex(it => it.item.id === id);
    data[path][index] = item;

    this.updateStore({ ...this.store.getValue(), data });
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

  private loadStore(): typeof storeData {
    let store;
    try {
      store = JSON.parse(localStorage.getItem(keyStore));
    } catch (e) {
    }

    if (!store) {
      store = {
        tags: [],
        data: {},
      };
    }

    return store;
  }

  private updateStore(store: typeof storeData): void {
    this.store.next(store);
    localStorage.setItem(keyStore, JSON.stringify(store));
  }

  private listenChangeStore(): void {
    window.addEventListener('storage', event => {
      if (event.key === keyStore) {
        const data = JSON.parse(event.newValue);
        this.updateStore(data);
      }
    });
  }

  private init(): Promise<typeof configData> {
    return Promise.all([
      fetch('/api/parser.json').then(res => res.json()),
      fetch('/api/types.json').then(res => res.json()),
    ]).then(([schemas, types]) => ({ schemas, types }));
  }

}
