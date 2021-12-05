import { ParserPreset } from '@shared/parser/interface';
import { parserAnimeOnline } from '@shared/parser/helpers/anime-online';
import { parserKinopoisk } from '@shared/parser/helpers/kinopoisk';
import { parserYoutube } from '@shared/parser/helpers/youtube';

export enum ParserActions {
  message = 'message',
  startImport = 'startImport'
}

export const parserPresets: ParserPreset[] = [
  {
    domain: 'smotret-anime.online',
    host: new RegExp(/\/users\/[0-9]+\/list/),
    func: parserAnimeOnline,
    messageHost: 'Парсинг доступен со страницы списка аниме',
  },
  {
    domain: 'kinopoisk.ru',
    host: new RegExp(/mykp\/movies/),
    func: parserKinopoisk,
    messageHost: `Парсинг доступен со страницы списка. https://www.kinopoisk.ru/mykp/movies/`,
  },
  {
    domain: 'youtube.com',
    host: '*',
    func: parserYoutube,
    messageHost: `Для начала парсинга нужно выделить текст`,
  },
];

