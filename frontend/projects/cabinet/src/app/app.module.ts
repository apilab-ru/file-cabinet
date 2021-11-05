import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LibraryComponent } from './library/library.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { AnalyzeComponent } from './analyze/analyze.component';
import { AssignerComponent } from './components/assigner/assigner.component';
import { StatusComponent } from './components/status/status.component';
import { FormsModule } from '@angular/forms';
import { LinkComponent } from './components/link/link.component';
import { GenresComponent } from './components/genres/genres.component';
import { FoundItemsComponent } from './components/found-items/found-items.component';
import { AddItemComponent } from './components/add-item/add-item.component';
import { StarsModule } from '../../../shared/stars/stars.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { SettingsComponent } from './settings/settings.component';
import { CleverSearchComponent } from './components/clever-search/clever-search.component';
import { ListModule } from './components/list/list.module';
import { FileCab } from '@shared/services/file-cab';

@NgModule({
  declarations: [
    AppComponent,
    LibraryComponent,
    AnalyzeComponent,
    AssignerComponent,
    StatusComponent,
    LinkComponent,
    GenresComponent,
    FoundItemsComponent,
    AddItemComponent,
    SettingsComponent,
    CleverSearchComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    FormsModule,
    StarsModule,
    LazyLoadImageModule,
    ListModule,
  ],
  providers: [
    {
      provide: FileCab,
      useFactory: () => window.chrome.extension.getBackgroundPage()['fileCab']
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    FoundItemsComponent,
    AddItemComponent,
  ]
})
export class AppModule { }
