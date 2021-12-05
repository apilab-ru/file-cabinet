import { ParserResponse } from '@shared/parser/interface';

export function parserKinopoisk(): ParserResponse[] {
  const list: ParserResponse[] = [];

  document.querySelector('#itemList')
    .querySelectorAll('li')
    .forEach(item$ => {
      const name = item$.querySelector('img').title.split('(')[0].trim();
      const url = item$.querySelector('a').href;

      list.push({
        name,
        type: url.includes('film') ? 'films' : 'tv',
        meta: { url },
      });
    });

  return list;
}
