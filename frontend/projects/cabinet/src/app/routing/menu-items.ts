import { Route } from '@angular/router';

export const MENU_ITEMS: (Route & { name: string })[] = [
  {
    path: 'anime',
    loadChildren: () => import('../pages/library/library.module').then(res => res.LibraryModule),
    name: 'Аниме',
    data: {
      path: 'anime',
    },
  },
  {
    path: 'films',
    loadChildren: () => import('../pages/library/library.module').then(res => res.LibraryModule),
    data: {
      path: 'films',
    },
    name: 'Фильмы',
  },
  {
    path: 'tv',
    loadChildren: () => import('../pages/library/library.module').then(res => res.LibraryModule),
    data: {
      path: 'tv',
    },
    name: 'Сериалы',
  },
  {
    path: 'settings',
    loadChildren: () => import('../pages/settings/settings.module').then(res => res.SettingsModule),
    name: 'Настройки',
  },
  {
    path: 'analyze',
    loadChildren: () => import('../pages/analyze/analyze.module').then(res => res.AnalyzeModule),
    name: 'Импорт из закладок',
  },
];
