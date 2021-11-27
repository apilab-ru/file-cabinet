import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [
    SettingsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([{
      path: '',
      component: SettingsComponent,
    }]),
    MatButtonModule,
    MatSnackBarModule,
  ],
})
export class SettingsModule {
}
