import { Injectable } from '@angular/core';
import { filter, first, map, switchMap } from 'rxjs/operators';
import { FilmsService } from './films.service';
import { fromEvent, Observable, of, ReplaySubject } from 'rxjs';
import { AnimeService } from './anime.service';
import { Library, Anime, Film, SearchRequestResult, Status } from '@cab/api';
import { ChromeApiService } from './chrome-api.service';

@Injectable({
  providedIn: 'root',
})
export class LibraryService {

  private store: Library;
  private key = 'store';
  private readonly nameExp = /([a-zA-zа-яА-яёЁ\s0-9]*)/;

  private storeSubject = new ReplaySubject<Library>(1);
  store$: Observable<Library> = this.storeSubject.asObservable();

  constructor(
    private filmsService: FilmsService,
    private animeService: AnimeService,
    private chromeApi: ChromeApiService,
  ) {
    this.loadState();
    this.listenChangeState();
  }

  getStatusList(): Promise<Status[]> {
    return this.chromeApi.fileCab.getStatusList();
  }

  addItemByName(path: string, fullName: string): Observable<void> {
    if (!this.store[path]) {
      this.store[path] = [];
    }
    const name = this.findName(fullName);
    switch (path) {
      case 'films':
        return this.addMovieByName(name);

      case 'tv':
        return this.addTvByName(name);

      case 'anime':
        break;
    }
  }

  addMovieByName(name: string): Observable<void> {
    return this.filmsService
      .findMovie(name)
      .pipe(
        switchMap(result => this.checkFindItem<Film>(name, result)),
        map(item => {
          this.store.data['films'].push({
            item,
            tags: []
          });
          this.saveStore();
        })
      );
  }

  addTvByName(name: string): Observable<void> {
    return this.filmsService
      .findTv(name)
      .pipe(
        switchMap(result => this.checkFindItem<Film>(name, result)),
        map(item => {
          this.store.data['tv'].push({
            item,
            tags: []
          });
          this.saveStore();
        })
      );
  }

  addAnimeByName(name: string): Observable<void> {
    return this.animeService
      .findAnime(name)
      .pipe(
        switchMap(result => this.checkFindItem<Anime>(name, result)),
        map(item => {
          this.store.data['anime'].push({
            item,
            tags: []
          });
          this.saveStore();
        })
      );
  }

  findName(fullName: string): string {
    return fullName.match(this.nameExp)[0].trim();
  }

  deleteItem(path, id: number): void {
    const index = this.store.data[path].indexOf(it => it.item.id === id);
    if (index !== -1) {
      this.store.data[path].splice(index, 1);
      this.saveStore();
    }
  }

  private checkFindItem<T>(name: string, result: SearchRequestResult<T>): Observable<T> {
    if (result.results.length === 1) {
      return of(result.results[0]);
    } else {
      alert('ADD popup to select result!');
    }
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
