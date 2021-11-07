import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { FileCab } from '@shared/services/file-cab';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    MatInputModule,
  ],
  providers: [
    {
      provide: FileCab,
      useFactory: () => window.chrome.extension.getBackgroundPage()['fileCab']
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
