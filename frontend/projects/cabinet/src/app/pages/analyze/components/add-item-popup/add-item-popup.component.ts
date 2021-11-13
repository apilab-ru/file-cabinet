import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BaseInfo } from '@shared/popup-add-item/models/base-info';
import { ItemType, LibraryItem } from '@shared/models/library';

@Component({
  selector: 'app-add-item-popup',
  templateUrl: './add-item-popup.component.html',
  styleUrls: ['./add-item-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddItemPopupComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { baseInfo: BaseInfo },
    private dialogRef: MatDialogRef<LibraryItem<ItemType>>,
  ) {
  }

  onSave(item: LibraryItem<ItemType>): void {
    this.dialogRef.close(item);
  }

}
