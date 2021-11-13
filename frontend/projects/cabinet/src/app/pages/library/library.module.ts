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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { MatButtonModule } from '@angular/material/button';
import { CardComponent } from './components/card/card.component';
import { CleverSearchComponent } from './components/clever-search/clever-search.component';
import { LoaderModule } from '@shared/loader/loader.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [
    CardComponent,
    CleverSearchComponent,
    GenresComponent,
    LibraryComponent,
    LinkComponent,
  ],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: LibraryComponent,
      },
    ]),
    CommonModule,
    FormsModule,
    LazyLoadImageModule,
    ListModule,
    LoaderModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    SharedModule,
    StarsModule,
    MatSnackBarModule,
  ],
})
export class LibraryModule {
}
