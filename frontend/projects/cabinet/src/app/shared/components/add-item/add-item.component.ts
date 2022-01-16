import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CardData } from '@shared/popup-add-item/models/card-data';
import { LibraryItem } from '../../../../../../../../server/src/library/interface';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddItemComponent {
  constructor(
    private dialogRef: MatDialogRef<AddItemComponent>,
    @Inject(MAT_DIALOG_DATA) public item: LibraryItem,
  ) {
  }

  send(cardData: CardData): void {
    const { type, name, ...metaData } = cardData;
    this.dialogRef.close(metaData);
  }

}
