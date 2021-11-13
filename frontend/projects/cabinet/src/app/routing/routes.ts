import { MENU_ITEMS } from './menu-items';

export const structList = [
  {
    name: 'Аниме',
    path: 'anime',
  },
  {
    name: 'Фильмы',
    path: 'films',
  },
  {
    name: 'Сериалы',
    path: 'tv',
  },
  {
    name: 'Статьи',
    path: 'articles',
  },
];

export const MAIN_ROUTES = [
  ...MENU_ITEMS,
  {
    path: '**',
    redirectTo: MENU_ITEMS[0].path,
  },
];
