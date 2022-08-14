import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef, TrackByFunction } from '@angular/core';
import { ListIteratorDirective, RowContext } from './list-iterator-directive';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent<T> {
  @Input() list: T[];

  @ContentChild(ListIteratorDirective, { static: false }) private listIterator: ListIteratorDirective<T>;

  get trackBy(): TrackByFunction<T> {
    return this.listIterator.listIteratorTrackBy;
  }

  get rowTemplate(): TemplateRef<RowContext<T>> {
    return this.listIterator.template;
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
