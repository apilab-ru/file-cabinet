import { Route } from '@angular/router';
import { SettingsComponent } from '../pages/settings/settings.component';

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
    component: SettingsComponent,
    name: 'Настройки',
  },
  {
    path: 'analyze',
    loadChildren: () => import('../pages/analyze/analyze.module').then(res => res.AnalyzeModule),
    name: 'Анализ',
  },
];
