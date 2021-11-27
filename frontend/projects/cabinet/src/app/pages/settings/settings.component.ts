import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LibraryService } from '../../services/library.service';
import { first, map, mergeMap } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';
import { Anime } from '../../../models';
import { AnimeService } from '../../services/anime.service';
import { saveAsFile } from '../../helpers/save-as-file';
import { Library, LibraryItem } from '@shared/models/library';
import { FileCabService } from '@shared/services/file-cab.service';
import * as exampleJson from './format.json';
import isArray from 'lodash/isArray';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  exampleJson = exampleJson['default'];

  constructor(
    private libraryService: LibraryService,
    private animeService: AnimeService,
    private fileCabService: FileCabService,
    private matSnackBar: MatSnackBar,
  ) {
  }

  backup(): void {
    this.fileCabService.store$
      .pipe(first())
      .subscribe(store => {
        const data = JSON.stringify(store);
        saveAsFile(data, 'backup.json');
      });
  }

  importFileChange(event: Event): void {
    const reader = new FileReader();
    reader.onload = this.importFileLoad.bind(this);
    const files = event.target['files'];
    if (files && files[0]) {
      reader.readAsText(files[0]);
    }
  }

  private importFileLoad(event: ProgressEvent): void {
    try {
      const res = JSON.parse(event.target['result']);
      const data = this.prepareFormat(res);
      this.matSnackBar.dismiss();
      this.libraryService.updateStore(data);
      this.matSnackBar.open('Успешно импортировано', undefined, {
        duration: 3000,
      });
    } catch (e) {
      this.matSnackBar.open(e, 'error');
    }
  }

  private prepareFormat(data: Library): Library {
    let result = {} as Library;
    if (data.tags) {
      result.tags = data.tags;
    }
    if (data.data) {
      for (const key in data.data) {
        if (!isArray(data.data[key])) {
          throw Error(`Неправильный формат, data[key] не массив`);
        }
      }

      result.data = data.data;
    } else {
      throw Error('Неправильный формат, не найден data');
    }

    return result;
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
        // this.libraryService.updateStore(resultStore);
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
