import { Route } from '@angular/router';

interface NavItemMeta {
  name: string;
  icon: string;
}

export const MENU_ITEMS: (Route & NavItemMeta)[] = [
  {
    path: 'anime',
    loadChildren: () => import('../pages/library/library.module').then(res => res.LibraryModule),
    name: 'Аниме',
    icon: 'icon-anime',
    data: {
      path: 'anime',
    },
  },
  {
    path: 'films',
    loadChildren: () => import('../pages/library/library.module').then(res => res.LibraryModule),
    name: 'Фильмы',
    icon: 'icon-ticket',
    data: {
      path: 'films',
    },
  },
  {
    path: 'tv',
    loadChildren: () => import('../pages/library/library.module').then(res => res.LibraryModule),
    name: 'Сериалы',
    icon: 'icon-tv',
    data: {
      path: 'tv',
    },
  },
  {
    path: 'settings',
    loadChildren: () => import('../pages/settings/settings.module').then(res => res.SettingsModule),
    name: 'Настройки',
    icon: 'icon-config',
  },
  {
    path: 'analyze',
    loadChildren: () => import('../pages/analyze/analyze.module').then(res => res.AnalyzeModule),
    name: 'Импорт',
    icon: 'icon-bookmarks',
  },
];
