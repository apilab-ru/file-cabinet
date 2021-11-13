import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StarsModule } from '@shared/stars/stars.module';
import { SettingsComponent } from '../settings/settings.component';
import { CleverSearchComponent } from './components/clever-search/clever-search.component';
import { RouterModule } from '@angular/router';
import { MAIN_ROUTES } from '../../routing/routes';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';

@NgModule({
  declarations: [
    AppComponent,
    CleverSearchComponent,
    SettingsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    FormsModule,
    StarsModule,
    RouterModule.forRoot(MAIN_ROUTES, { useHash: true }),
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatRadioModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
