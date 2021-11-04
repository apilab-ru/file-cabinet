import { LibraryComponent } from './library/library.component';
import { Route } from '@angular/router';
import { AnalyzeComponent } from './analyze/analyze.component';
import { SettingsComponent } from './settings/settings.component';

export const MENU_ITEMS: (Route & {name: string})[]  = [
  {
    path: 'anime',
    component: LibraryComponent,
    name: 'Аниме',
    data: {
      path: 'anime'
    },
  },
  {
    path: 'films',
    component: LibraryComponent,
    data: {
      path: 'films'
    },
    name: 'Фильмы'
  },
  {
    path: 'tv',
    component: LibraryComponent,
    data: {
      path: 'tv'
    },
    name: 'Сериалы'
  },
  {
    path: 'articles',
    component: LibraryComponent,
    name: 'Статьи'
  },
  {
    path: 'settings',
    component: SettingsComponent,
    name: 'Настройки'
  },
  {
    path: 'analyze',
    component: AnalyzeComponent,
    name: 'Анализ'
  }
];
