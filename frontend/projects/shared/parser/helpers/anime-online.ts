import { ParserResponse } from '@shared/parser/interface';
import { StatusList } from '@shared/const';

const statusCast = {
  'Смотрю': StatusList.process,
  'Просмотрено': StatusList.complete,
  'Отложено': StatusList.planned,
  'Брошено': StatusList.drop,
  'Запланировано': StatusList.planned,
};

export function parserAnimeOnline(): ParserResponse[] {
  const list = [];

  document.querySelectorAll('.m-animelist-card').forEach(card$ => {
    const statusRaw = card$.querySelector('.card-title')['innerText'];
    const status = statusCast[statusRaw];

    card$.querySelectorAll('.m-animelist-item').forEach(item$ => {
      const id = +item$['dataset']['id'];
      const tdList = item$.querySelectorAll('td');

      const name = tdList[1].innerText.split('/')[0].trim();
      const progress = +tdList[2].innerText.split('/')[0].trim();
      const scoreRaw = tdList[3].innerText.trim();
      const star = scoreRaw === '-' ? 0 : +scoreRaw;

      list.push({
        id,
        name,
        type: 'anime',
        meta: {
          progress,
          star,
          status,
        },
      });
    });
  });

  return list;
}
