import { LibraryItemType } from '../../models';

export enum KinopoiskFilmType {
  film = 'FILM',
  tvShows = 'TV_SHOW',
  tvSeries = 'TV_SERIES',
  miniSeries = 'MINI_SERIES',
}

export const KINOPOISK_FILM_TYPE_MAP: Record<KinopoiskFilmType, LibraryItemType> = {
  [KinopoiskFilmType.film]: LibraryItemType.movie,
  [KinopoiskFilmType.tvShows]: LibraryItemType.tv,
  [KinopoiskFilmType.tvSeries]: LibraryItemType.tv,
  [KinopoiskFilmType.miniSeries]: LibraryItemType.tv,
};

export const KINOPOISK_GENRES = [
  {
    'id': 1,
    'genre': 'триллер',
  },
  {
    'id': 2,
    'genre': 'драма',
  },
  {
    'id': 3,
    'genre': 'криминал',
  },
  {
    'id': 4,
    'genre': 'мелодрама',
  },
  {
    'id': 5,
    'genre': 'детектив',
  },
  {
    'id': 6,
    'genre': 'фантастика',
  },
  {
    'id': 7,
    'genre': 'приключения',
  },
  {
    'id': 8,
    'genre': 'биография',
  },
  {
    'id': 9,
    'genre': 'фильм-нуар',
  },
  {
    'id': 10,
    'genre': 'вестерн',
  },
  {
    'id': 11,
    'genre': 'боевик',
  },
  {
    'id': 12,
    'genre': 'фэнтези',
  },
  {
    'id': 13,
    'genre': 'комедия',
  },
  {
    'id': 14,
    'genre': 'военный',
  },
  {
    'id': 15,
    'genre': 'история',
  },
  {
    'id': 16,
    'genre': 'музыка',
  },
  {
    'id': 17,
    'genre': 'ужасы',
  },
  {
    'id': 18,
    'genre': 'мультфильм',
  },
  {
    'id': 19,
    'genre': 'семейный',
  },
  {
    'id': 20,
    'genre': 'мюзикл',
  },
  {
    'id': 21,
    'genre': 'спорт',
  },
  {
    'id': 22,
    'genre': 'документальный',
  },
  {
    'id': 23,
    'genre': 'короткометражка',
  },
  {
    'id': 24,
    'genre': 'аниме',
  },
  {
    'id': 25,
    'genre': '',
  },
  {
    'id': 26,
    'genre': 'новости',
  },
  {
    'id': 27,
    'genre': 'концерт',
  },
  {
    'id': 28,
    'genre': 'для взрослых',
  },
  {
    'id': 29,
    'genre': 'церемония',
  },
  {
    'id': 30,
    'genre': 'реальное ТВ',
  },
  {
    'id': 31,
    'genre': 'игра',
  },
  {
    'id': 32,
    'genre': 'ток-шоу',
  },
  {
    'id': 33,
    'genre': 'детский',
  },
];

export const KINOPOISK_GENRES_MAP = {};
KINOPOISK_GENRES.forEach(item => {
  KINOPOISK_GENRES_MAP[item.genre] = item.id;
});
