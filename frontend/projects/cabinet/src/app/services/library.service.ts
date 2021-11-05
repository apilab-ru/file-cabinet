import { Injectable } from '@angular/core';
import { first } from 'rxjs/operators';
import { FilmsService } from './films.service';
import { from, Observable, Subject } from 'rxjs';
import { AnimeService } from './anime.service';
import { Anime, Film, ISchema, ItemType, Library, LibraryItem, SearchRequestResult } from '../../api';
import { ChromeApiService } from './chrome-api.service';
import { MatDialog } from '@angular/material/dialog';
import { FoundItemsComponent } from '../components/found-items/found-items.component';
import { FileCab } from '@shared/services/file-cab';

export interface ItemParams {
  tags?: string[];
  status?: string;
  comment?: string;
}

@Injectable({
  providedIn: 'root',
})
export class LibraryService {
  private readonly nameExp = /([a-zA-zа-яА-яёЁ\s0-9]*)/;
  private schemas: ISchema[];

  store$: Observable<Library>;

  constructor(
    private filmsService: FilmsService,
    private animeService: AnimeService,
    private chromeApi: ChromeApiService,
    private dialog: MatDialog,
    private fileCab: FileCab,
  ) {
    this.store$ = this.fileCab.store$;
  }

  addItem(path: string, item: LibraryItem<ItemType>): Observable<any> {
    return from(this.fileCab.addItemLibToStore(path, item));
  }

  addItemByName(path: string, name: string, params?: ItemParams): Observable<ItemType> {
    return from(this.fileCab.addItem(path, name, params || {}));
  }

  findItem(path: string, name: string): Observable<SearchRequestResult<Film | Anime>> {
    switch (path) {
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
    let host = url.split('/')[2];
    if (host.substr(0, 4) === 'www.') {
      host = host.substr(4);
    }
    return host;
  }

  deleteItem(path: string, id: number): void {
    this.fileCab.deleteItem(path, id);
  }

  updateItem(path: string, id: number, item): void {
    this.fileCab.updateItem(path, id, item);
  }

  updateStore(store: Library): void {
    console.log('xxx store', store);
  }


  private showModalSelectItem(list: (Anime | Film)[]): Observable<Anime | Film> {
    const subject = new Subject<Anime | Film>();
    const dialog = this.dialog.open(FoundItemsComponent, {
      data: list,
    });
    dialog.afterClosed().subscribe((item) => {
      if (item) {
        subject.next(item);
      } else {
        subject.error({ code: 'notSelected' });
      }
    });
    return subject.asObservable().pipe(first());
  }
}
