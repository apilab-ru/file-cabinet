import { NgModule } from '@angular/core';
import { StarsComponent } from './stars.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    StarsComponent,
  ],
  exports: [
    StarsComponent,
  ],
  entryComponents: [
    StarsComponent,
  ],
})
export class StarsModule {
}
