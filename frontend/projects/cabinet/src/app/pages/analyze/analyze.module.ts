import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyzeComponent } from './analyze.component';
import { RouterModule } from '@angular/router';
import { MatTreeModule } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { AssignerComponent } from './components/assigner/assigner.component';
import { AddItemPopupComponent } from './components/add-item-popup/add-item-popup.component';
import { PopupAddItemModule } from '@shared/popup-add-item/popup-add-item.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [
    AnalyzeComponent,
    AssignerComponent,
    AddItemPopupComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: AnalyzeComponent,
      },
    ]),
    MatTreeModule,
    MatButtonModule,
    PopupAddItemModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
})
export class AnalyzeModule {
}
