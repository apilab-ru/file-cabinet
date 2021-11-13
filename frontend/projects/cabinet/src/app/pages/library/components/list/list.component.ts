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
import { map } from 'rxjs/operators';

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

  limitList = [12, 24, 28, 100];

  @ContentChild(ListIteratorDirective, { static: false }) private listIterator: ListIteratorDirective<T>;

  ngOnInit(): void {
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
      console.log('xxx next', this.page);
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

  private calcShowData(data: T[], page: number, limit: number): T[] {
    const start = (page - 1) * limit;
    const end = page * limit;
    return data.slice(start, end);
  }
}
