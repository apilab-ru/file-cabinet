import { Injectable } from '@angular/core';
import { filter, first, map, switchMap } from 'rxjs/operators';
import { FilmsService } from './films.service';
import { fromEvent, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { AnimeService } from './anime.service';
import { Library, Anime, Film, SearchRequestResult, Status, Item, ISchema } from '@cab/api';
import { ChromeApiService } from './chrome-api.service';
import { MatDialog } from '@angular/material';
import { FoundItemsComponent } from '../components/found-items/found-items.component';

export interface ItemParams {
  tags?: string[];
  status?: string;
  comment?: string;
}

@Injectable({
  providedIn: 'root',
})
export class LibraryService {

  private store: Library;
  private key = 'store';
  private readonly nameExp = /([a-zA-zа-яА-яёЁ\s0-9]*)/;

  private storeSubject = new ReplaySubject<Library>(1);
  private schemas: ISchema[];
  store$: Observable<Library> = this.storeSubject.asObservable();

  constructor(
    private filmsService: FilmsService,
    private animeService: AnimeService,
    private chromeApi: ChromeApiService,
    private dialog: MatDialog,
  ) {
    this.loadState();
    this.listenChangeState();
    this.chromeApi.fileCab.reload()
      .then(({schemas, types}) => {
        this.schemas = schemas;
      });
  }

  getStatusList(): Promise<Status[]> {
    return this.chromeApi.fileCab.getStatusList();
  }

  addItemByName(path: string, name: string, params?: ItemParams): Observable<void> {
    if (!this.store[path]) {
      this.store[path] = [];
    }
    return this.findItem(path, name)
      .pipe(
        switchMap(result => this.checkFindItem(name, result)),
        switchMap(item => this.checkUnique(path, item)),
        map(item => {
          this.store.data[path].push({
            item,
            ...params
          });
          this.saveStore();
        })
      )
  }

  findItem(path: string, name: string): Observable<SearchRequestResult<Film | Anime>> {
    switch(path) {
      case 'films':
        return this.filmsService.findMovie(name);

      case 'tv':
        return this.filmsService.findTv(name);

      case 'anime':
        return this.animeService.findAnime(name);
    }
  }

  findName(fullName: string, url?: string): string {
    const host = url && this.getHost(url);
    const schema = this.schemas[host];
    if (schema) {
      return eval(schema.func)(fullName);
    } else {
      return fullName.match(this.nameExp)[0].trim();
    }
  }

  getHost(url: string): string {
    return url.split('/')[2];
  }

  deleteItem(path: string, id: number): void {
    const index = this.store.data[path].findIndex(it => it.item.id === id);
    if (index !== -1) {
      this.store.data[path].splice(index, 1);
      this.saveStore();
    }
  }

  updateItem(path: string, id: number, item) {
    const index = this.store.data[path].findIndex(it => it.item.id === id);
    this.store.data[path][index] = item;
    this.saveStore();
  }

  private checkUnique(path: string, item: Anime | Film): Observable<Anime | Film> {
    const result$ = new Subject<Anime | Film>();
    if (this.store.data[path]) {
      const found = this.store.data[path].find(it => it.item.id === item.id);
      if (found) {
        result$.error({code: 'notUnique', item: found});
      } else {
        result$.next(item);
      }
    } else {
      result$.next(item);
    }
    return result$.asObservable().pipe(first());
  }

  private checkFindItem(name: string, result: SearchRequestResult<Anime | Film>): Observable<Anime | Film> {
    if (result.results.length === 1) {
      return of(result.results[0]);
    } else {
      return this.showModalSelectItem(result.results);
    }
  }

  private showModalSelectItem(list: (Anime | Film)[]): Observable<Anime | Film> {
    const subject = new Subject<Anime | Film>();
    const dialog = this.dialog.open(FoundItemsComponent, {
      data: list
    });
    dialog.afterClosed().subscribe((item) => {
      if (item) {
        subject.next(item);
      } else {
        subject.error({code: 'notSelected'});
      }
    });
    return subject.asObservable().pipe(first());
  }

  private saveStore(): void {
    localStorage.setItem(this.key, JSON.stringify(this.store));
    this.storeSubject.next(this.store);
  }

  private loadState(): void {
    try {
      this.store = JSON.parse(localStorage.getItem(this.key));
    } catch (e) {}
    if (!this.store) {
      this.loadBaseState();
    } else {
      this.storeSubject.next(this.store);
    }
  }

  private listenChangeState(): void {
    fromEvent(window, 'storage')
      .pipe(filter((event: StorageEvent) => event.key === this.key))
      .subscribe((event: StorageEvent) => {
        const data = JSON.parse(event.newValue);
        this.store = data;
        this.storeSubject.next(data);
      });
  }

  private loadBaseState(): void {
    this.store = {
      tags: [],
      data: {}
    };
    this.saveStore();
  }
}
