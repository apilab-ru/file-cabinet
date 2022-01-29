import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Genre } from '@server/models/genre';

@Component({
  selector: 'app-genres',
  templateUrl: './genres.component.html',
  styleUrls: ['./genres.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenresComponent implements OnChanges {
  @Input() list: number[];
  @Input() genres: Genre[];

  @Output() clickGenre = new EventEmitter<number>();

  genresList: Genre[];

  ngOnChanges(changes: SimpleChanges): void {
    if (this.list && this.genres) {
      this.genresList = this.list.map(id => this.genres.find(genre => genre.id === +id))
        .filter(it => !!it);
    }
  }

  clickTag(tag: number): void {
    this.clickGenre.emit(tag);
  }
}
