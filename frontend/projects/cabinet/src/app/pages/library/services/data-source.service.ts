import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DataSourceState } from '../models/interface';
import { makeStore } from '@shared/store';

@Injectable()
export class DataSourceService<T> {
  list$: Observable<T[]>;

  state = makeStore({
    hasMore: false,
    loading: true,
    total: 0,
  });
  state$: Observable<DataSourceState> = this.state.select();
}
