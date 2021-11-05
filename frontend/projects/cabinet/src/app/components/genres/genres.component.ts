import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Genre } from '../../../api';

const findName = (list, id): string => {
  const tag = list && list.find(g => g.id == id);
  if (!tag && list) {
    console.error('not found tag', id, list)
  }
  return tag && tag.name;
};

@Component({
  selector: 'app-genres',
  templateUrl: './genres.component.html',
  styleUrls: ['./genres.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenresComponent {

  @Input() list: number[];

  @Input() genres: Genre[];

  @Output() clickGenre = new EventEmitter<number>();

  getName(id: number): string {
    return findName(this.genres, id);
  }

  clickTag(tag: number): void {
    this.clickGenre.emit(tag);
  }
}
