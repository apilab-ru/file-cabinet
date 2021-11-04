import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Anime, Film } from '@cab/api';

type FoundItem = Anime | Film;

@Component({
  selector: 'app-found-items',
  templateUrl: './found-items.component.html',
  styleUrls: ['./found-items.component.scss']
})
export class FoundItemsComponent {

  constructor(
    public dialogRef: MatDialogRef<FoundItemsComponent>,
    @Inject(MAT_DIALOG_DATA) public list: FoundItem[],
  ) {
  }

  selectItem(item: FoundItem): void {
    this.dialogRef.close(item);
  }

}
