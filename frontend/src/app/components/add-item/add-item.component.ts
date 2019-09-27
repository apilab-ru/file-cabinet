import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { LibraryService } from '../../services/library.service';

interface MatDialogData {
  path: string;
  title: string;
  fullName: string;
  url: string;
}

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent {

  path: string;
  title: string;
  fullName: string;
  url: string;

  status = 'planned';

  constructor(
    public dialogRef: MatDialogRef<AddItemComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MatDialogData,
  ) {
    Object.assign(this, data);
  }

}
