import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  TrackByFunction,
} from '@angular/core';
import { ListIteratorDirective, RowContext } from './list-iterator-directive';
import { PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BreakpointsService } from '../../../../services/breakpoints.service';
import { Breakpoint } from '../../../../../models/breakpoint';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

const SIZES = {
  [Breakpoint.fullHd]: [15, 25, 50, 100],
  [Breakpoint.hd]: [12, 24, 48, 96],
  [Breakpoint.tabletWide]: [9, 18, 36, 72],
  [Breakpoint.mobile]: [10, 20, 50, 100],
};

@UntilDestroy()
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent<T> implements OnInit, OnChanges {
  @Input() list: T[];
  @Input() page = 1;

  @Output() pageChange = new EventEmitter<number>();

  data$ = new ReplaySubject<T[]>(1);
  showData$: Observable<T[]>;
  total$: Observable<number>;
  page$ = new BehaviorSubject<number>(1);
  limit$ = new BehaviorSubject<number>(12);

  limitList$: Observable<number[]>;

  @ContentChild(ListIteratorDirective, { static: false }) private listIterator: ListIteratorDirective<T>;

  constructor(
    private breakpointsService: BreakpointsService,
  ) {
  }

  ngOnInit(): void {
    this.limitList$ = this.breakpointsService.breakpoint$.pipe(
      map(breakpoint => SIZES[breakpoint] || []),
    );

    this.limitList$.pipe(untilDestroyed(this)).subscribe(list => {
      this.limit$.next(list[0]);
    });

    this.showData$ = combineLatest([
      this.data$,
      this.page$,
      this.limit$,
    ]).pipe(
      map(([data, page, limit]) => this.calcShowData(data, page, limit)),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.list) {
      this.data$.next(this.list);
    }
    if (changes.page) {
      this.page$.next(this.page);
    }
  }

  get trackBy(): TrackByFunction<T> {
    return this.listIterator.listIteratorTrackBy;
  }

  get rowTemplate(): TemplateRef<RowContext<T>> {
    return this.listIterator.template;
  }

  setPage(page: PageEvent): void {
    this.page$.next(page.pageIndex + 1);
    this.pageChange.emit(page.pageIndex + 1);
    this.limit$.next(page.pageSize);
  }

  private calcShowData(data: T[] | undefined, page: number, limit: number): T[] {
    if (!data) {
      return [];
    }

    const start = (page - 1) * limit;
    const end = page * limit;
    return data.slice(start, end);
  }
}
