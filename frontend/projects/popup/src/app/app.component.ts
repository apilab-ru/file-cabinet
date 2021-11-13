import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { Types } from '@shared/const';
import { UntilDestroy } from '@ngneat/until-destroy';
import { BrowserApiService } from './services/browser-api.service';
import { combineLatest, from, Observable, of } from 'rxjs';
import { trimTitle } from '@shared/utils/trim-title';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaseInfo } from '@shared/popup-add-item/models/base-info';
import { FileCabService } from '@shared/services/file-cab.service';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  baseInfo$: Observable<BaseInfo | null>;
  schemas$ = this.fileCabService.schemas$;

  constructor(
    private browserApiService: BrowserApiService,
    private matSnackBar: MatSnackBar,
    private fileCabService: FileCabService,
  ) {
  }

  ngOnInit(): void {
    this.baseInfo$ = this.createBaseInfo();
  }

  onSave(): void {
    this.matSnackBar.open('Сохранено', undefined, {
      duration: 2000,
    });
  }

  private createBaseInfo(): Observable<BaseInfo | null> {
    return this.schemas$.pipe(
      switchMap(schemas => combineLatest([
        of(schemas),
        from(this.browserApiService.getActiveTabTitle(schemas)),
        from(this.browserApiService.getActiveTabLinks()),
      ])),
      map(([schemas, title, { url, domain }]) => {
        const currentScheme = schemas[domain];
        const name = trimTitle(title, currentScheme?.func);

        return {
          type: currentScheme?.type || Types.films,
          name,
          url,
          domain,
        };
      }),
      catchError(() => of(null)),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }
}
