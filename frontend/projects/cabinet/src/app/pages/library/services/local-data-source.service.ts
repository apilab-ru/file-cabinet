import { Injectable } from '@angular/core';
import { DataSourceService } from './data-source.service';
import { LibraryItem } from '../../../../models';
import { LibraryService } from '../../../services/library.service';
import { combineLatest, Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { SearchService } from './search.service';
import { DataSourceFormService } from './data-source-form.service';
import { makeStore } from '@shared/store';
import { DataSourceState } from '../models/interface';
import { OrderType } from '../models/order-type';
import orderBy from 'lodash/orderBy';
import { ORDER_DEFAULT } from '../models/const';

@Injectable()
export class LocalDataSourceService extends DataSourceService<LibraryItem> {
  state = makeStore({
    hasMore: false,
    loading: true,
    total: 0,
  });
  state$: Observable<DataSourceState> = this.state.select();

  constructor(
    private libraryService: LibraryService,
    private searchService: SearchService,
    private formService: DataSourceFormService,
  ) {
    super();
    this.list$ = this.makeList();
  }

  private makeList(): Observable<LibraryItem[]> {
    return combineLatest([
      this.getFromLibrary(),
      this.searchService.status$,
      this.formService.page$,
      this.formService.limit$,
      this.formService.orderType$,
      this.formService.orderField$,
    ]).pipe(
      tap(() => {
        this.state.loading.next(true);
      }),
      map(([data, status, page, limit, orderType, orderField]) => {
        let list = this.searchService.filterByState(data, status);
        list = this.sort(list, orderField, orderType);

        const start = (page - 1) * limit;
        const end = page * limit;
        const pageList = list.slice(start, end);

        this.state.total.next(list.length);
        this.state.hasMore.next(end < list.length);

        return pageList;
      }),
      tap(() => {
        this.state.loading.next(false);
      }),
    );
  }

  private getFromLibrary(): Observable<LibraryItem[]> {
    return combineLatest([
      this.searchService.path$,
      this.libraryService.data$,
    ]).pipe(
      map(([path, data]) => data[path] || []),
    );
  }

  private sort(list: LibraryItem[], orderField: string, orderType: OrderType): LibraryItem[] {
    if (orderField === ORDER_DEFAULT) {
      return orderType === OrderType.desc ? list.reverse() : list;
    }

    return orderBy(list, orderField, orderType);
  }
}
