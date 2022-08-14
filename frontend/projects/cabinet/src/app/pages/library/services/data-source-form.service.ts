import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OrderType } from '../models/order-type';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { fromFormControl } from '@shared/utils/observer-from-form';
import { distinctUntilChanged, filter, map, pairwise, shareReplay, withLatestFrom } from 'rxjs/operators';
import { ORDER_DEFAULT } from '../models/const';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { OrderField } from '../models/interface';
import { BreakpointsService } from '../../../services/breakpoints.service';
import { Breakpoint } from '../../../../models/breakpoint';
import { makeStore } from '@shared/store';

const SIZES = {
  [Breakpoint.fullHd]: [15, 25, 50, 100],
  [Breakpoint.hd]: [12, 24, 48, 96],
  [Breakpoint.tabletWide]: [9, 18, 36, 72],
  [Breakpoint.mobile]: [10, 20, 50, 100],
};

@UntilDestroy()
@Injectable()
export class DataSourceFormService {
  private store = makeStore({
    maxLimit: 100,
    orderList: [] as OrderField[],
  });

  formGroup: FormGroup;
  limit$: Observable<number>;
  limitList$: Observable<number[]>;
  page$: Observable<number>;
  orderType$: Observable<OrderType>;
  orderField$: Observable<string>;
  orderFieldList$ = this.store.orderList;

  constructor(
    private fb: FormBuilder,
    private breakpointsService: BreakpointsService,
  ) {
    this.formGroup = this.createForm();

    this.page$ = fromFormControl<number>(this.formGroup.get('page'));
    this.limit$ = fromFormControl<number>(this.formGroup.get('limitSize')).pipe(
      filter(limit => !!limit),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.orderType$ = fromFormControl<OrderType>(this.formGroup.get('orderType'));
    this.orderField$ = fromFormControl<string>(this.formGroup.get('orderField'));

    this.limitList$ = combineLatest([
      this.store.maxLimit,
      this.breakpointsService.breakpoint$,
    ]).pipe(
      map(([max, breakpoint]) => SIZES[breakpoint].filter(it => it <= max) || []),
    );

    combineLatest([
      this.limitList$,
      this.limit$,
    ]).pipe(
      untilDestroyed(this),
    ).subscribe(([list, limit]) => {
      if (!list.includes(limit)) {
        this.formGroup.patchValue({ limitSize: list[0] });
      }
    });

    this.limit$.pipe(
      distinctUntilChanged(),
      pairwise(),
      withLatestFrom(this.page$),
      map(([[prevSize, currentSize], page]) => ({ prevSize, currentSize, page })),
      filter(({ page }) => page !== 1),
      untilDestroyed(this),
    ).subscribe(({ prevSize, currentSize, page }) => {
      const newPage = Math.ceil((prevSize * page) / currentSize);
      this.setPage(newPage);
    });

    this.orderFieldList$.pipe(
      untilDestroyed(this),
    ).subscribe(list => this.formGroup.patchValue({ orderField: list[0]?.key }));
  }

  setPage(page: number): void {
    this.formGroup.patchValue({ page });
  }

  setMaxLimit(limit: number): void {
    this.store.maxLimit.next(limit);
  }

  setOrderList(list: OrderField[]): void {
    this.store.orderList.next(list);
  }

  private createForm(): FormGroup {
    return this.fb.group({
      orderField: ORDER_DEFAULT,
      orderType: OrderType.asc,
      page: 1,
      limitSize: undefined,
    });
  }
}
