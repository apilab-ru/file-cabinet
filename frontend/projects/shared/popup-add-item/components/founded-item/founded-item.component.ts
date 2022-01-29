import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { MediaItem } from '@server/models';
import { Genre } from '@server/models/genre';

enum ViewMode {
  view = 'view',
  description = 'description'
}

@Component({
  selector: 'app-founded-item',
  templateUrl: './founded-item.component.html',
  styleUrls: ['./founded-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoundedItemComponent implements OnChanges {
  @Input() item: MediaItem;
  @Input() genres: Genre[];
  @Input() withoutEmitter = false;

  @Output() selectedChange = new EventEmitter<MediaItem>();

  mode: ViewMode = ViewMode.view;
  genresList: Genre[];
  iconInfo = require('!file-loader!./images/info.svg').default;
  iconInfoFilled = require('!file-loader!./images/info_outline.svg').default;

  ngOnChanges(): void {
    if (this.item && this.genres) {
      this.genresList = this.getGenres(this.genres, this.item.genreIds);
    }
  }

  select(item: MediaItem): void {
    this.selectedChange.emit(item);
  }

  toggleMode(): void {
    this.mode = this.mode === ViewMode.view ? ViewMode.description : ViewMode.view;
  }

  private getGenres(genres: Genre[], ids: number[]): Genre[] {
    return ids?.map(id => genres.find(it => +it.id === +id))
      .filter(item => !!item);
  }

}
