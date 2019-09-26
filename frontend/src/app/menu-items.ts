import { AnimeComponent } from './anime/anime.component';
import { FilmsComponent } from './films/films.component';
import { Route } from '@angular/router';
import { AnalyzeComponent } from './analyze/analyze.component';

export const MENU_ITEMS: (Route & {name: string})[]  = [
  {
    path: 'anime',
    component: AnimeComponent,
    name: 'Аниме'
  },
  {
    path: 'films',
    component: FilmsComponent,
    data: {
      mode: 'films'
    },
    name: 'Фильмы'
  },
  {
    path: 'tv',
    component: FilmsComponent,
    data: {
      mode: 'tv'
    },
    name: 'Сериалы'
  },
  {
    path: 'articles',
    component: FilmsComponent,
    name: 'Статьи'
  },
  {
    path: 'analyze',
    component: AnalyzeComponent,
    name: 'Анализ'
  }
];
