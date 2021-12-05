import { ParserResponse } from '@shared/parser/interface';

export function parserYoutube(): ParserResponse[] {
  const list = window.getSelection().toString().split('\n').map(item => {
    return item.replace(/[0-9]{2}:[0-9]{2}/, '').trim();
  });

  return list.map(name => ({ name }));
}
