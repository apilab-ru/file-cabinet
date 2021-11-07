import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ItemType, MetaData } from '../../../../models';

interface ItemData extends MetaData {
  title?: string;
  fullName?: string;
  item?: ItemType;
  path: string;
}

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddItemComponent {

  data: MetaData;
  title: string;
  fullName: string;
  path: string;

  constructor(
    private dialogRef: MatDialogRef<AddItemComponent>,
    @Inject(MAT_DIALOG_DATA) data: ItemData,
  ) {
    const {path, title, fullName, ...item} = data;
    this.data = {
      ...item,
      status: item.status || 'planned'
    };
    this.title = title;
    this.path = path;
    this.fullName = fullName;
  }

  get isShowStar(): boolean {
    return this.data.status === 'complete' || this.data.status === 'process' || this.data.status === 'drop';
  }

  send(): void {
    this.dialogRef.close({
      path: this.path,
      title: this.title,
      param: this.data
    });
  }

}
