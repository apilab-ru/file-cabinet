import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MediaItem } from '@server/models';
import { Genre } from '@server/models/genre';

@Component({
  selector: 'app-founded-list',
  templateUrl: './founded-list.component.html',
  styleUrls: ['./founded-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoundedListComponent {
  @Input() list: MediaItem[];
  @Input() genres: Genre[];
  @Input() foundedItem: MediaItem;

  @Output() selectedChange = new EventEmitter<MediaItem>();

  select(item: MediaItem): void {
    this.selectedChange.emit(item);
  }

  trackBy(index: number, item: MediaItem): number {
    return item.id;
  }
}
