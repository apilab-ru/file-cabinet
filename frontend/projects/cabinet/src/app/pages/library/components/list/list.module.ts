import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list.component';
import { ListIteratorDirective } from './list-iterator-directive';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [
    ListComponent,
    ListIteratorDirective,
  ],
  exports: [
    ListComponent,
    ListIteratorDirective,
  ],
  imports: [
    CommonModule,
    MatPaginatorModule,
  ],
})
export class ListModule {
}
