import { Component, ContentChild, Input, TemplateRef, TrackByFunction } from '@angular/core';
import { ListIteratorDirective, RowContext } from './list-iterator-directive';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent<T> {

  data: T[];
  showData: T[];
  page = 1;
  limit = 12;
  limitList = [12, 24, 28, 100];
  total = 0;

  @ContentChild(ListIteratorDirective, { static: false }) private listIterator: ListIteratorDirective<T>;

  @Input() set list(list: T[]) {
    // Костыль, не сбивать паджинацию при удалении одного элемента
    if (this.data && Math.abs(this.data.length - list.length) > 1) {
      this.page = 1;
    }
    this.data = list;
    this.total = list.length;
    this.calcShowData();
  }

  get trackBy(): TrackByFunction<T> {
    return this.listIterator.listIterator;
  }

  get rowTemplate(): TemplateRef<RowContext<T>> {
    return this.listIterator.template;
  }

  get hasData(): boolean {
    return this.showData && !!this.showData.length;
  }

  calcShowData(): void {
    const start = (this.page - 1) * this.limit;
    const end = this.page * this.limit;
    this.showData = this.data.slice(start, end);
  }

  setPage(page: PageEvent): void {
    this.page = page.pageIndex + 1;
    this.limit = page.pageSize;
    this.calcShowData();
  }

}
