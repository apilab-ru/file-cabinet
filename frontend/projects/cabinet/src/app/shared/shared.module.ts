import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusComponent } from './components/status/status.component';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AddItemComponent } from './components/add-item/add-item.component';
import { FoundItemsComponent } from './components/found-items/found-items.component';
import { FormsModule } from '@angular/forms';
import { StarsModule } from '@shared/stars/stars.module';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    StatusComponent,
    AddItemComponent,
    FoundItemsComponent,
  ],
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    StarsModule,
  ],
  exports: [
    StatusComponent,
    AddItemComponent,
    FoundItemsComponent,
  ],
  entryComponents: [
    AddItemComponent,
    FoundItemsComponent,
  ],
})
export class SharedModule {
}
