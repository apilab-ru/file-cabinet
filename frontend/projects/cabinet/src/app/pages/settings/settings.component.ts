import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LibraryService } from '../../services/library.service';
import { first, map, mergeMap, take } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';
import { LibraryItem } from '../../../models';
import { AnimeService } from '../../services/anime.service';
import { saveAsFile } from '../../helpers/save-as-file';
import { Library } from '@shared/models/library';
import { FileCabService } from '@shared/services/file-cab.service';
import * as exampleJson from './format.json';
import * as isArray from 'lodash/isArray';
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

  clearDoubles(): void {
    this.libraryService.store$.pipe(
      take(1),
      map(store => {
        return {
          ...store,
          data: Object.entries(store.data)
            .reduce((obj, [key, list]) => ({ ...obj, [key]: this.clearDoublesList(list, key) }),
              {}),
        };
      }),
    ).subscribe(store => {
      this.libraryService.updateStore(store);
      this.matSnackBar.open('Дубли удалены', undefined, {
        duration: 3000,
      });
    });
  }

  private clearDoublesList(list: LibraryItem[], path: string): LibraryItem[] {
    return list.filter((item, index) => index === list
      .findIndex(it => it.item.id === item.item.id),
    );
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
}
