import { MENU_ITEMS } from './menu-items';

export const MAIN_ROUTES = [
  ...MENU_ITEMS,
  {
    path: '**',
    redirectTo: MENU_ITEMS[0].path,
  },
];
