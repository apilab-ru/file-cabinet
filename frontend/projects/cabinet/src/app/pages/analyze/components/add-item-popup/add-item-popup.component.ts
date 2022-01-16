import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BaseInfo } from '@shared/popup-add-item/models/base-info';
import { LibraryItem } from '../../../../../../../../../server/src/library/interface';

@Component({
  selector: 'app-add-item-popup',
  templateUrl: './add-item-popup.component.html',
  styleUrls: ['./add-item-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddItemPopupComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { baseInfo: BaseInfo },
    private dialogRef: MatDialogRef<LibraryItem>,
  ) {
  }

  onSave(item: LibraryItem): void {
    this.dialogRef.close(item);
  }

}
