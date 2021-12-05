import { Injectable } from '@angular/core';
import { FilmsService } from './films.service';
import { Observable } from 'rxjs';
import { AnimeService } from './anime.service';
import { Anime, Film, SearchRequestResult } from '../../models';
import { ChromeApiService } from './chrome-api.service';
import { ItemType, Library, LibraryItem } from '@shared/models/library';
import { FileCabService } from '@shared/services/file-cab.service';

export interface ItemParams {
  tags?: string[];
  status?: string;
  comment?: string;
}

@Injectable({
  providedIn: 'root',
})
export class LibraryService {
  data$ = this.fileCabService.data$;
  store$ = this.fileCabService.store$;

  constructor(
    private filmsService: FilmsService,
    private animeService: AnimeService,
    private chromeApi: ChromeApiService,
    private fileCabService: FileCabService,
  ) {
  }

  addItem(path: string, item: LibraryItem<ItemType>): Observable<any> {
    return this.fileCabService.addItemLibToStore(path, item);
  }

  deleteItem(path: string, id: number): void {
    this.fileCabService.deleteItem(path, id);
  }

  updateItem(path: string, id: number, item): void {
    this.fileCabService.updateItem(path, id, item);
  }

  updateStore(store: Library): void {
    this.fileCabService.updateStore(store);
  }
}
