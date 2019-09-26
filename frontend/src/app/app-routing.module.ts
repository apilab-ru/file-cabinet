import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MENU_ITEMS } from './menu-items';

const routes: Routes = [
  ...MENU_ITEMS,
  {
    path: '**',
    redirectTo: MENU_ITEMS[0].path
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
