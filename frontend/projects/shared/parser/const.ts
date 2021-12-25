import { ParserPreset } from '@shared/parser/interface';
import { parserAnimeOnline } from '@shared/parser/helpers/anime-online';
import { parserKinopoisk } from '@shared/parser/helpers/kinopoisk';
import { parserYoutube } from '@shared/parser/helpers/youtube';

export enum ParserActions {
  message = 'message',
  startImport = 'startImport'
}

export const parserSchemas = {
  'anidub.tv': {
    func: '(title) => title.split(\'/\')[1].split(\'[\')[0]',
    type: 'anime',
  },
  'animestars.org': {
    func: '(title) => title.split(\'/\')[0]',
    title: 'document.querySelector(\'.short-t-or\').innerText',
    type: 'anime',
  },
  'smotret-anime-365.ru': {
    func: '(title) => title.substr(15).match(/([\\S\\s]*)\\. онлайн\\./)[1].trim()',
    type: 'anime',
  },
  'smotret-anime.online': {
    func: '(title) => title',
    title: 'document.querySelector(\'.line-1\')?.innerText || document.title',
    type: 'anime',
  },
  'kinopoisk.ru': {
    func: '(title) => title.split(/[\\-\\—]/)[0].replace(/([\\(\\)0-9]{6})/, \'\')',
    type: 'films',
  },
  'kino.mail.ru': {
    func: '(title) => { var [ru, en] = title.split(/[()]/); var res = en.split(\',\'); return res.length > 1 ? res[0] : ru }',
    type: 'films',
  },
  'afisha.mail.ru': {
    func: '(title) => { var [ru, en] = title.split(/[()]/); var res = en.split(\',\'); return res.length > 1 ? res[0] : ru }',
    type: 'films',
  },
  'ivi.ru': {
    func: '(title) => title.substr(6).split(\'(\')[0].trim()',
    type: 'films',
  },
  'animego.org': {
    type: 'anime',
    func: '(title) => title.replace(\'смотреть онлайн\', \'\').replace(\'— Аниме\', \'\')',
  },
  'shikimori.one': {
    type: 'anime',
    title: 'document.querySelector(\'h1\').textContent.split(\'/\')[0]',
  },
};

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

