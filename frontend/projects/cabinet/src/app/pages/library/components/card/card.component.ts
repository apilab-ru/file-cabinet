import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { deepCopy, Genre } from '../../../../../models';
import { ItemType, LibraryItem } from '@shared/models/library';
import isEqual from 'lodash/isEqual';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent implements OnChanges {
  @Input() item: LibraryItem<ItemType>;
  @Input() genres: Genre[];
  @Input() isLibraryMode = false;

  @Output() updateItem = new EventEmitter<LibraryItem<ItemType>>();
  @Output() deleteItem = new EventEmitter<void>();
  @Output() addItem = new EventEmitter<void>();
  @Output() clickGenre = new EventEmitter<number>();

  placeholder = 'assets/placeholder-loading.svg';
  placeholderError = 'assets/placeholder-error.svg';
  isShowStars = false;
  localItem: LibraryItem<ItemType>;
  isChanged = false;
  isEditMode = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.item) {
      this.isShowStars = this.checkIsShowStars(this.item?.status);
      this.localItem = deepCopy(this.item);
    }
  }

  onClickGenre(genreId: number): void {
    this.clickGenre.emit(genreId);
  }

  onSetStars(star: number): void {
    this.localItem.star = star;
    this.isChanged = this.checkIsChanged();
  }

  onSetProgress(progress: number): void {
    this.localItem.progress = progress;
    this.isChanged = this.checkIsChanged();
  }

  onSetStatus(status: string): void {
    this.localItem.status = status;
    this.isShowStars = this.checkIsShowStars(status);
    this.isChanged = this.checkIsChanged();
  }

  onSetComment(comment: string): void {
    this.localItem.comment = comment;
    this.isChanged = this.checkIsChanged();
  }

  update(): void {
    this.isChanged = false;
    this.updateItem.emit(this.localItem);
    this.isEditMode = false;
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
  }

  private checkIsShowStars(status: string): boolean {
    return status === 'complete' || status === 'process' || status === 'drop';
  }

  private checkIsChanged(): boolean {
    return !isEqual(this.localItem, this.item);
  }
}
