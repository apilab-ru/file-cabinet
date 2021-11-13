import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PopupAddItemModule } from '@shared/popup-add-item/popup-add-item.module';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    PopupAddItemModule,
    MatButtonModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
