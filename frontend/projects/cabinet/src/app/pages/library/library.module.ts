import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LibraryComponent } from './library.component';
import { ListModule } from './components/list/list.module';
import { GenresComponent } from './components/genres/genres.component';
import { MatIconModule } from '@angular/material/icon';
import { LinkComponent } from './components/link/link.component';
import { SharedModule } from '../../shared/shared.module';
import { StarsModule } from '@shared/stars/stars.module';
import { FormsModule } from '@angular/forms';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { MatButtonModule } from '@angular/material/button';
import { CardComponent } from './components/card/card.component';

@NgModule({
  declarations: [
    LibraryComponent,
    GenresComponent,
    LinkComponent,
    CardComponent,
  ],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: LibraryComponent,
      },
    ]),
    CommonModule,
    LazyLoadImageModule,
    ListModule,
    MatButtonModule,
    MatIconModule,
    SharedModule,
    StarsModule,
    FormsModule,
  ],
})
export class LibraryModule {
}
