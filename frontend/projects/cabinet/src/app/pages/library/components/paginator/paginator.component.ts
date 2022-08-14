import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { OrderType } from '../../models/order-type';
import { DataSourceFormService } from '../../services/data-source-form.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DataFactoryService } from '../../services/data-factory.service';
import { fromFormControl } from '@shared/utils/observer-from-form';

@UntilDestroy()
@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent implements OnInit {
  formGroup: FormGroup = this.dataSourceFormService.formGroup;
  orderTypes: OrderType[] = Object.values(OrderType);

  orderFieldList$ = this.dataSourceFormService.orderFieldList$;
  limitList$ = this.dataSourceFormService.limitList$;
  limit$ = this.dataSourceFormService.limit$;
  orderType$ = this.dataSourceFormService.orderType$;
  orderField$ = this.dataSourceFormService.orderField$;
  state$ = this.dataFactoryService.state$;
  hasPrev$: Observable<boolean>;
  hasNext$: Observable<boolean>;
  page$: Observable<number>;
  totalPages$: Observable<number | undefined>;

  constructor(
    private dataSourceFormService: DataSourceFormService,
    private dataFactoryService: DataFactoryService,
  ) {
  }

  ngOnInit(): void {
    this.limitList$.pipe(
      take(1),
      untilDestroyed(this),
    ).subscribe(list => {
      this.formGroup.patchValue({ limitSize: list[0] });
    });

    this.hasNext$ = this.state$.pipe(
      map(state => state.hasMore),
    );

    this.page$ = this.dataSourceFormService.page$;
    const limitSize$ = fromFormControl<number>(this.formGroup.get('limitSize'));
    this.totalPages$ = combineLatest([
      limitSize$,
      this.state$,
    ]).pipe(
      map(([limit, state]) => {
        if (!state.total) {
          return undefined;
        }

        return Math.ceil(state.total / limit);
      }),
    );

    this.hasPrev$ = this.page$.pipe(
      map(page => page > 1),
    );
  }

  setOrderField(orderField: string): void {
    this.formGroup.patchValue({ orderField });
  }

  setOrderType(orderType: OrderType): void {
    this.formGroup.patchValue({ orderType });
  }

  setLimit(limitSize: number): void {
    this.formGroup.patchValue({ limitSize });
  }

  nextPage(): void {
    const page = this.formGroup.get('page').value;
    this.formGroup.patchValue({ page: page + 1 });
  }

  prevPage(): void {
    const page = this.formGroup.get('page').value;
    this.formGroup.patchValue({ page: page - 1 });
  }
}
