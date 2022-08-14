import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LibraryComponent } from './library.component';
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
import { ProgressModule } from '@shared/progress/progress.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PaginatorComponent } from './components/paginator/paginator.component';
import { ListComponent } from './components/list/list.component';
import { ListIteratorDirective } from './components/list/list-iterator-directive';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    CardComponent,
    CleverSearchComponent,
    GenresComponent,
    LibraryComponent,
    LinkComponent,
    PaginatorComponent,

    ListComponent,
    ListIteratorDirective,
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
    LoaderModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
    MatTooltipModule,
    ProgressModule,
    ReactiveFormsModule,
    SharedModule,
    StarsModule,
    MatSelectModule,
  ],
})
export class LibraryModule {
}
