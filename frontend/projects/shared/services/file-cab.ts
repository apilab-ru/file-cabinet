import { BehaviorSubject, from, Observable } from 'rxjs';
import { STATUS_LIST } from '../const';
import {
  deepCopy,
  ISchema,
  ItemType,
  LibraryItem,
  MetaData,
  NavigationItem,
  SearchRequestResult,
} from '../../cabinet/src/api';
import { shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { fileCabApi } from './file-cab.api';

const nameExp = /([a-zA-zа-яА-яёЁ\s0-9]*)/;
const keyStore = 'store';

const configData = {
  schemas: [] as ISchema[],
  types: [] as NavigationItem[],
};

const storeData = {
  tags: [],
  data: {} as Record<string, LibraryItem<ItemType>[]>,
};

export class FileCab {
  private store = new BehaviorSubject<typeof storeData>(storeData);
  private config = new BehaviorSubject<typeof configData>(configData);
  private popup: any = null;

  statusList = STATUS_LIST;
  config$: Observable<typeof configData>;
  initedData: Promise<typeof configData>;
  store$: Observable<typeof storeData> = this.store.asObservable();

  constructor() {
    this.config$ = from(this.init()).pipe(
      tap(data => this.config.next(data)),
      switchMap(() => this.config),
      shareReplay(1),
    );
    this.initedData = this.config$.pipe(
      take(1),
    ).toPromise();

    this.updateStore(this.loadStore());
    this.listenChangeStore();
  }

  searchData(path: string, name: string): Promise<SearchRequestResult<ItemType>> {
    name = this.trimName(name);

    switch (path) {
      case 'anime':
        return fileCabApi.searchAnime(name).toPromise();

      case 'films':
        return fileCabApi.searchFilm(name).toPromise();

      case 'tv':
        return fileCabApi.searchTv(name).toPromise();

      default:
        return new Promise((reolve, rejected) => rejected(`path ${name} not support`));
    }
  }

  reload(): Promise<typeof configData> {
    return this.init().then(res => {
      this.config.next(res);
      return res;
    });
  }

  addItem(path: string, name: string, param: MetaData): Promise<ItemType> {
    console.log('add item', path, name, param);

    return this.searchData(path, name)
      .then(res => this.checkResults(res))
      .then(item => this.checkUnique(path, item))
      .then(item => {
        this.addItemToStore(path, item, param);
        return item;
      });
  }

  addItemLibToStore(path: string, item:  LibraryItem<ItemType>): Promise<void> {
    return this.checkUnique(path, item.item)
      .then(() => {
        const meta = deepCopy(item);
        delete meta.item;

        this.addItemToStore(path, item.item, meta);
      })
  }

  addItemToStore(path: string, item: ItemType, param: MetaData): void {
    console.log('add item to store', item, path, param);

    const { data } = this.store.getValue();

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
  }

  checkResults(res: SearchRequestResult<ItemType>) {
    if (res.total_results === 1) {
      return Promise.resolve(res.results[0]);
    } else {
      if (!this.popup) {
        console.error('popup null', this);
        return Promise.reject({ code: 'popupNull' });
      }
      return this.popup.showModal(res.results);
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
      console.log('storage change', event);
      if (event.key === keyStore) {
        const data = JSON.parse(event.newValue);
        this.updateStore(data);
      }
    });
  }

  private trimName(fullName: string): string {
    return fullName.match(nameExp)[0].trim();
  }

  private init(): Promise<typeof configData> {
    return Promise.all([
      fetch('/api/parser.json').then(res => res.json()),
      fetch('/api/types.json').then(res => res.json()),
    ]).then(([schemas, types]) => ({ schemas, types }));
  }

}
