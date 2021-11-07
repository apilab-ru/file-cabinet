import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyzeComponent } from './analyze.component';
import { RouterModule } from '@angular/router';
import { MatTreeModule } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { AssignerComponent } from './components/assigner/assigner.component';

@NgModule({
  declarations: [
    AnalyzeComponent,
    AssignerComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: AnalyzeComponent,
      },
    ]),
    MatTreeModule,
    MatButtonModule,
  ],
})
export class AnalyzeModule {
}
