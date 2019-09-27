import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule,
  MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatSelectModule,
  MatTabsModule,
  MatTreeModule,
} from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule,
  ],
  exports: [
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule,
  ],
})
export class SharedModule {
}
