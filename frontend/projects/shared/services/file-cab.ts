import { BehaviorSubject, merge, NEVER, Observable, of, ReplaySubject, Subject, throwError } from 'rxjs';
import {
  deepCopy,
  FIREBASE_EVENT_TABLE,
  LibraryItem,
  LibraryItemType,
  MediaItem,
  NavigationItem,
  SearchRequestResult,
} from '../../cabinet/src/models';
import {
  catchError,
  debounceTime,
  filter,
  map,
  shareReplay,
  skip,
  startWith,
  switchMap,
  take, tap,
  withLatestFrom,
} from 'rxjs/operators';
import { fileCabApi } from './file-cab.api';
import { MetaData } from '@server/models/meta-data';
import {
  ISchema,
  ItemType,
  Library,
  LibraryItemOld,
  LibraryOld,
  LibrarySettings,
  UserData,
} from '@shared/models/library';
import { Tag } from '@shared/models/tag';
import { TYPES } from '../models/const';
import { ChromeStoreApi } from '@shared/services/chrome-store.api';
import { parserSchemas } from '@shared/parser/const';
import { captureException } from '@sentry/angular';
import { FirebaseService } from '@shared/services/firebase.service';
import { Genre } from '@server/models/genre';
import { userApiService } from './user-api.service';
import { notificationsService } from './notifications.service';
import { MediaCompareData } from '@shared/models/media-compare';
import { mediaCompare } from '@shared/utils/item-compare';

const configData = {
  schemas: {} as Record<string, ISchema>,
  types: [] as NavigationItem[],
};

const storeData = {
  tags: [] as Tag[],
  data: {} as Record<string, LibraryItem[]>,
  lastTimeUpdate: 0,
};

const DEBOUNCE_TIME_AFTER_UPDATE = 20_000;

export interface ItemParam extends MediaCompareData {
  name?: string;
  url?: string;
}

export class FileCab {
  private store = new BehaviorSubject<Library>(storeData);
  private config = new BehaviorSubject<typeof configData>(this.init());
  private storeApi = new ChromeStoreApi();
  private settingsUpdate = new Subject<LibrarySettings>();
  private storeUpdateQuery = new ReplaySubject<void>(1);
  private storeLoadEvent = new Subject<void>();
  private lastTimeUpdate = null;

  private notificationsService = notificationsService;
  private firebaseService = new FirebaseService();
  private userApiService = userApiService;

  config$: Observable<typeof configData>;
  store$: Observable<typeof storeData> = this.store.asObservable();

  genres$: Observable<Genre[]>;

  settings$: Observable<LibrarySettings>;

  constructor() {
    this.config$ = this.config.asObservable().pipe(
      shareReplay(1),
    );

    this.config$.subscribe();

    this.genres$ = fileCabApi.loadGenres().pipe(
      shareReplay(1),
    );

    this.loadStore().pipe(
      take(1),
      withLatestFrom(this.genres$),
      map(([store, genres]) => ({
        ...store,
        data: this.migrateData(store.data, genres),
      }) as Library),
    ).subscribe(store => this.updateStore(store));

    this.store$.subscribe(store => {
      this.lastTimeUpdate = store.lastTimeUpdate;
    });

    this.settings$ = merge(
      this.storeApi.getGlobalStorage(),
      this.settingsUpdate,
    ).pipe(
      startWith({}),
      debounceTime(0),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    this.updateListenersInit();
  }

  private listenUpdateLibrary(settings: UserData): Observable<UserData> {
    return merge(
      this.firebaseService.selectData<number>(FIREBASE_EVENT_TABLE + '/' + settings.id).pipe(
        debounceTime(100),
        map((time) => ({ settings, time })),
        filter(({ time }) => time >= this.lastTimeUpdate),
        map(() => settings),
      ),
      this.storeLoadEvent.asObservable().pipe(
        map(() => settings),
      ),
    );
  }

  private updateListenersInit(): void {
    let lastSettings;

    const settingsUpdate$ = this.settings$.pipe(
      tap(set => lastSettings = set),
      map(settings => settings.user && settings.enableSync ? settings.user : null),
    );

    settingsUpdate$.pipe(
      switchMap(settings => !settings
        ? NEVER
        : this.listenUpdateLibrary(settings),
      ),
      switchMap((settings) => this.userApiService.loadLibrary(settings.token)),
    ).subscribe(store => {
      this.updateStore(store, false);
    });

    settingsUpdate$.pipe(
      switchMap(settings => !settings
        ? NEVER
        : this.storeUpdateQuery.pipe(
          skip(1),
          debounceTime(100),
          withLatestFrom(this.store$),
          map(([, store]) => ({ settings, store })),
        ),
      ),
      switchMap(({ settings, store }) => this.userApiService.postLibrary(settings.token, store)),
      tap(() => this.lastTimeUpdate = new Date().getTime() + DEBOUNCE_TIME_AFTER_UPDATE),
      catchError(error => {
        console.error(error);

        if (error.message === 'notFoundUser') {
          this.notificationsService.addMessage('syncErrorUserNotFound');

          delete lastSettings.user;
          this.updateSettings(lastSettings);
        }

        return of();
      }),
    ).subscribe();
  }

  updateSettings(settings: LibrarySettings): void {
    this.settingsUpdate.next(settings);
    this.storeApi.setGlobalStorage(settings);
  }

  searchInStore(
    path: string,
    item: ItemParam,
  ): Observable<LibraryItem | null> {
    return this.store$.pipe(
      take(1),
      map(store => store.data && store.data[path] || []),
      map(list => list.find(
        it => it.item.title === item.name
          || it.url === item.url
          || it.name === item.name
      ) || null),
    );
  }

  searchApi(path: string, name: string): Observable<SearchRequestResult<MediaItem>> {
    switch (path) {
      case 'anime':
        return fileCabApi.searchAnime({ name });

      case 'films':
        return fileCabApi.searchFilm({ name });

      case 'tv':
        return fileCabApi.searchTv({ name });

      default:
        return throwError(`path ${name} not support`);
    }
  }

  loadById(path: string, id: number): Observable<MediaItem> {
    switch (path) {
      case 'anime':
        return fileCabApi.getAnimeById(id);
    }
  }

  addItemLibToStore(path: string, libItem: LibraryItem): Promise<void> {
    return this.checkUnique(path, libItem.item)
      .then(() => {
        const { item, ...meta } = libItem;

        this.addItemToStore(path, item, meta);
      });
  }

  addOrUpdate(path: string, item: MediaItem, metaData: MetaData): Observable<LibraryItem> {
    return this.checkExisted(path, item).pipe(
      map(isExisted => isExisted ? this.updateItem(path, {
        ...metaData,
        item,
      }) : this.addItemToStore(path, item, metaData)),
    );
  }

  checkExisted(path: string, item: ItemParam): Observable<boolean> {
    return this.store.asObservable().pipe(
      map(store => this.syncCheckExisted(store.data, path, item)),
      take(1),
    );
  }

  private syncCheckExisted(data: Record<string, LibraryItem[]> | undefined, path: string, item: ItemParam): boolean {
    if (!data || !data[path]) {
      return false;
    }

    return !!data[path].find(it => mediaCompare(it.item, item) || (item.url && item.url === it.url),
    );
  }

  addItemToStore(path: string, item: MediaItem, param: MetaData): LibraryItem {
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

  checkUnique(path: string, item: MediaItem): Promise<MediaItem> {
    const { data } = this.store.getValue();

    if (data[path]) {
      const founded = data[path].find(it => mediaCompare(it.item, item));
      if (founded) {
        return Promise.reject({ code: 'notUnique', item: founded });
      }
    }
    return Promise.resolve(item);
  }


  updateItem(path: string, item: LibraryItem): LibraryItem {
    const { data } = deepCopy(this.store.getValue());

    if (!data[path]) {
      data[path] = [];
    }

    const index = data[path].findIndex(it => it.item.id === item.item.id);

    data[path][index] = item;

    this.updateStore({ ...this.store.getValue(), data });

    return item;
  }

  deleteItem(path: string, item: MediaItem): void {
    const { data } = deepCopy(this.store.getValue());

    if (!data[path]) {
      return;
    }

    const index = data[path].findIndex(it => it.item.id === item.id);
    if (index !== -1) {
      data[path].splice(index, 1);
      this.updateStore({ ...this.store.getValue(), data });
    }
  }

  updateStore(store: Library, skipSync = false): void {
    store = { ...store, lastTimeUpdate: new Date().getTime() };

    this.store.next(store);
    this.storeApi.setStore(store);

    if (!skipSync) {
      this.sendUpdate();
    }
  }

  sendUpdate(): void {
    this.storeUpdateQuery.next();
  }

  sendLoadStore(): void {
    this.storeLoadEvent.next(undefined);
  }

  private loadStore(): Observable<Library | LibraryOld> {
    return this.storeApi.getStore<Library | LibraryOld>().pipe(
      map(store => {

        if (!store) {
          store = {
            tags: [],
            data: {},
            lastTimeUpdate: 0,
          };
        }

        if (!store.data) {
          store.data = {};
        }

        if (!store.tags) {
          store.tags = [];
        }

        return store;
      }),
      catchError((error) => {
        captureException(error);

        return of({
          tags: [],
          data: {},
          lastTimeUpdate: 0,
        });
      }),
    );
  }

  private init(): typeof configData {
    return {
      schemas: parserSchemas,
      types: TYPES,
    };
  }

  private migrateData(
    data: Record<string, (LibraryItemOld<ItemType> | LibraryItem)[]>,
    genres: Genre[],
  ): Record<string, Partial<LibraryItem>[]> {
    const animeGenresMap = genres.reduce((obj, item) => {
      if (item.smotretId) {
        obj[item.smotretId] = item.id;
      }

      return obj;
    }, {});

    const filmsGenresMap = genres.reduce((obj, item) => {
      if (item.imdbId) {
        obj[item.imdbId] = item.id;
      }

      return obj;
    }, {});

    return {
      anime: data.anime.map(data => ({
        ...data,
        item: {
          ...this.dataItemConverter(data.item, animeGenresMap, 'smotretId'),
          smotretId: data.item.id,
        },
      })),
      films: data.films.map(data => ({
        ...data,
        item: {
          ...this.dataItemConverter(data.item, filmsGenresMap, 'imdbId'),
          imdbId: data.item.id,
          type: LibraryItemType.movie,
        },
      })),
      tv: data.tv.map(data => ({
        ...data,
        item: {
          ...this.dataItemConverter(data.item, filmsGenresMap, 'imdbId'),
          imdbId: data.item.id,
          type: LibraryItemType.tv,
        },
      })),
    };
  }

  private dataItemConverter(
    item: ItemType | MediaItem,
    genresMap: Record<number, number>,
    fieldId: keyof MediaItem,
  ): MediaItem {
    if ((item as MediaItem).genreIds) {
      if (!item.id) {
        return {
          ...item,
          id: item[fieldId],
        } as MediaItem;
      }

      return item as MediaItem;
    }

    return {
      title: item.title,
      originalTitle: (item as ItemType).original_title,
      description: item.description,
      image: item.image,
      genreIds: (item as MediaItem).genreIds || (item as ItemType).genre_ids.map(id => genresMap[id]),
      popularity: item.popularity,
      year: item.year,
      episodes: item.episodes,
      type: item.type,
      [fieldId]: item.id,
      url: null,
      id: item.id,
    } as MediaItem;
  }

}
