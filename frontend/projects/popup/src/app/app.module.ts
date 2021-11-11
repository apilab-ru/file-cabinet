import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { FileCab } from '@shared/services/file-cab';
import { MatInputModule } from '@angular/material/input';
import { PopupComponent } from './components/popup/popup.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StarsModule } from '@shared/stars/stars.module';
import { ProgressModule } from '@shared/progress/progress.module';
import { FoundedListComponent } from './components/founded-list/founded-list.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HorizontalScrollDirective } from './directives/horizontal-scroll.directive';

@NgModule({
  declarations: [
    AppComponent,
    PopupComponent,
    FoundedListComponent,
    HorizontalScrollDirective,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    StarsModule,
    ProgressModule,
    MatTooltipModule,
  ],
  exports: [
    PopupComponent,
    FoundedListComponent,
  ],
  providers: [
    {
      provide: FileCab,
      useFactory: () => window.chrome.extension.getBackgroundPage()['fileCab'],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
