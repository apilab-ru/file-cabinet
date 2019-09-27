import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AnimeComponent } from './anime/anime.component';
import { FilmsComponent } from './films/films.component';
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
import { StarsModule } from '../../projects/stars/src/app/stars/stars.module';

@NgModule({
  declarations: [
    AppComponent,
    AnimeComponent,
    FilmsComponent,
    AnalyzeComponent,
    AssignerComponent,
    StatusComponent,
    LinkComponent,
    GenresComponent,
    FoundItemsComponent,
    AddItemComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    HttpClientModule,
    FormsModule,
    StarsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [
    FoundItemsComponent,
    AddItemComponent,
  ]
})
export class AppModule { }
