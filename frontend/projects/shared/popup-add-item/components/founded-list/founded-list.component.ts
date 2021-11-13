import { ChangeDetectionStrategy, Component, Input, Output } from '@angular/core';
import { ItemType } from '@shared/models/library';
import { Genre } from '@server/api/base';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-founded-list',
  templateUrl: './founded-list.component.html',
  styleUrls: ['./founded-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoundedListComponent {
  @Input() list: ItemType[];
  @Input() genres: Genre[];
  @Output() selectedChange = new EventEmitter<number>();

  getGenres(genres: Genre[], ids: number[]): string[] {
    return ids?.map(id => genres?.find(it => it.id === id)?.name)
      .filter(item => !!item);
  }

  select(selected: number): void {
    this.selectedChange.emit(selected);
  }

  trackBy(index: number, item: ItemType): number {
    return item.id;
  }
}
