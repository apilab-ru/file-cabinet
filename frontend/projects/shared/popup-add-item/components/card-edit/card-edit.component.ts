import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Status } from '@shared/models/status-item';
import { NavigationItem } from '@shared/models/navigation';
import { checkIsShowStar } from '@shared/utils/check-is-show-star';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ItemType, LibraryItem } from '@shared/models/library';
import { CardData } from '../../models/card-data';
import { checkIsShowProgress } from '@shared/utils/check-is-show-progress';
import { STATUS_LIST } from '@shared/const';

@Component({
  selector: 'app-card-edit',
  templateUrl: './card-edit.component.html',
  styleUrls: ['./card-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardEditComponent implements OnChanges, OnInit {
  @Input() types: NavigationItem[];
  @Input() selectedType: string;
  @Input() item: LibraryItem<ItemType>;
  @Input() name: string;
  @Input() isShowLibrary = true;

  @Output() update = new EventEmitter<CardData>();

  isShowStar$: Observable<boolean>;
  isShowProgress$: Observable<boolean>;

  statuses = STATUS_LIST;
  formGroup = new FormGroup({
    name: new FormControl(''),
    status: new FormControl(''),
    type: new FormControl(''),
    comment: new FormControl(''),
    star: new FormControl(''),
    progress: new FormControl(''),
  });

  ngOnInit(): void {
    this.isShowStar$ = this.formGroup.valueChanges.pipe(
      startWith(this.formGroup.getRawValue()),
      map(({ status }) => checkIsShowStar(status)),
    );
    this.isShowProgress$ = this.formGroup.valueChanges.pipe(
      startWith(this.formGroup.getRawValue()),
      map(({ status }) => checkIsShowProgress(status)),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.item) {
      this.formGroup.patchValue(this.item);
    }
    if (changes.selectedType) {
      this.formGroup.patchValue({
        type: this.selectedType,
      });
    }
    if (changes.name) {
      this.formGroup.patchValue({
        name: this.name,
      });
    }
  }

  selectType(type: string): void {
    this.selectedType = type;
    this.formGroup.patchValue({ type });
  }

  save(): void {
    this.update.emit(this.formGroup.getRawValue());
  }
}