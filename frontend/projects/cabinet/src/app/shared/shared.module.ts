import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusComponent } from './components/status/status.component';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AddItemComponent } from './components/add-item/add-item.component';
import { FormsModule } from '@angular/forms';
import { PopupAddItemModule } from '@shared/popup-add-item/popup-add-item.module';
import { LayoutTopSlotDirective } from './directives/layout-top-slot.directive';

@NgModule({
  declarations: [
    StatusComponent,
    AddItemComponent,
    LayoutTopSlotDirective,
  ],
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    PopupAddItemModule,
  ],
  exports: [
    StatusComponent,
    AddItemComponent,
    LayoutTopSlotDirective,
  ],
  entryComponents: [
    AddItemComponent,
  ],
})
export class SharedModule {
}
