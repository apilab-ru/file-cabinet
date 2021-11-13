import { Component } from '@angular/core';
import { LibraryService } from '../../services/library.service';
import { first, map, mergeMap } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';
import { Anime } from '../../../models';
import { AnimeService } from '../../services/anime.service';
import { saveAsFile } from '../../helpers/save-as-file';
import { LibraryItem } from '@shared/models/library';
import { FileCabService } from '@shared/services/file-cab.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  constructor(
    private libraryService: LibraryService,
    private animeService: AnimeService,
    private fileCabService: FileCabService,
  ) {
  }

  prepareFilms(): void {
    this.libraryService.data$
      .pipe(first())
      .subscribe(data => {
        this.prepareYear(data.films);
        this.prepareYear(data.tv);

        this.libraryService.updateStore({ data });
      });
  }

  prepareYear(list) {
    list
      .filter(item => !item.item.year)
      .forEach(item => {
        item.item.year = +item.item.date.split('-')[0];
      });
  }

  backup(): void {
    this.fileCabService.store$
      .pipe(first())
      .subscribe(store => {
        const data = JSON.stringify(store);
        saveAsFile(data, 'backup.json');
      });
  }

  prepareAnime(): void {
    this.fileCabService.store$
      .pipe(
        first(),
        mergeMap(store => forkJoin(
          of(store),
          ...store.data.anime.map(item => this.checkAnime(item as LibraryItem<Anime>)),
        )),
      )
      .subscribe(([store, ...anime]) => {
        const resultStore = {
          data: {
            ...store.data,
            anime,
          },
          tags: store.tags,
        };
        this.libraryService.updateStore(resultStore);
      });
  }

  fixStatusAnime() {
    /*this.libraryService.store$
      .pipe(first()).subscribe(store => {
      store.data.anime.forEach(item => {
        if (item.status === 'completed') {
          item.status = 'complete';
        }
      });
      this.libraryService.updateStore(store);
    });*/
  }

  restoreAnime() {
    this.fileCabService.store$
      .pipe(first())
      .subscribe(store => {
        store.data.anime.forEach(item => {
          item.item.image = item.item.image.replace('smotret-anime-365.ru', 'smotret-anime.online');
        });
        delete store['anime'];
        delete store['films'];
        delete store['tv'];
        this.libraryService.updateStore(store);
      });
  }

  checkAnime(libraryItem: LibraryItem<Anime>): Observable<LibraryItem<Anime>> {
    if (!libraryItem.item.episodes) {
      return this.animeService.getById(libraryItem.item.id).pipe(map(item => ({
        ...libraryItem,
        item,
      })));
    } else {
      return of(libraryItem);
    }
  }

}
