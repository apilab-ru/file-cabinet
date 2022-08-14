import { Observable } from 'rxjs';
import { LibraryItem, LibraryMode } from '../../../../models';
import { map, switchMap, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { SearchService } from './search.service';
import { LocalDataSourceService } from './local-data-source.service';
import { ExternalDataSourceService } from './external-data-source.service';
import { DataSourceService } from './data-source.service';
import { DataSourceState } from '../models/interface';

@Injectable()
export class DataFactoryService {
  list$: Observable<LibraryItem[]>;
  state$: Observable<DataSourceState>;

  private source$: Observable<DataSourceService<LibraryItem>>;

  constructor(
    private localDataService: LocalDataSourceService,
    private externalDataService: ExternalDataSourceService,
    private searchService: SearchService,
  ) {
    this.source$ = this.searchService.mode$.pipe(
      map(mode => mode === LibraryMode.library ? this.localDataService : this.externalDataService),
    );

    this.list$ = this.source$.pipe(
      switchMap(source => source.list$),
    );

    this.state$ = this.source$.pipe(
      switchMap(source => source.state$),
    );
  }
}
