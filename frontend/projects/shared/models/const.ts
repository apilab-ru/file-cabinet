export const TYPES = [
  {
    path: 'anime',
    name: 'Аниме',
  },
  {
    path: 'films',
    name: 'Фильмы',
  },
  {
    path: 'tv',
    name: 'Сериалы',
  },
];

export const PARSER_TYPES = {
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
    func: '(title) => title.substr(15).match(/([\\S\\s]*)\\. онлайн\\./)[1].trim()',
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