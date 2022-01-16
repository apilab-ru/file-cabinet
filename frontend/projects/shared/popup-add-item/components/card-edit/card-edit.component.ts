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
import { NavigationItem } from '@shared/models/navigation';
import { checkIsShowStar } from '@shared/utils/check-is-show-star';
import { FormControl, FormGroup } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CardData } from '../../models/card-data';
import { checkIsShowProgress } from '@shared/utils/check-is-show-progress';
import { STATUS_LIST } from '@shared/const/const';
import { SearchData } from '@shared/popup-add-item/models/search-data';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LibraryItem } from '@server/models';

@UntilDestroy()
@Component({
  selector: 'app-card-edit',
  templateUrl: './card-edit.component.html',
  styleUrls: ['./card-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardEditComponent implements OnChanges, OnInit {
  @Input() selectedType: string;
  @Input() item: Partial<LibraryItem>;
  @Input() name: string;
  @Input() isShowLibrary = true;
  @Input() isSearchMode = true;

  @Output() update = new EventEmitter<CardData>();
  @Output() updateSearchData = new EventEmitter<SearchData>();

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

    combineLatest([
      this.formGroup.get('name').valueChanges.pipe(startWith(this.formGroup.get('name').value)),
      this.formGroup.get('type').valueChanges.pipe(startWith(this.formGroup.get('type').value)),
    ]).pipe(
      untilDestroyed(this),
    ).subscribe(([name, type]) => {
      this.updateSearchData.emit({ name, type });
    });
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

  save(): void {
    this.update.emit(this.formGroup.getRawValue());
  }
}
