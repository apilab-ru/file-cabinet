import { Status } from '@shared/models/status-item';

export enum Types {
  anime = 'anime',
  films = 'films',
  tv = 'tv'
}

export enum StatusList {
  planned = 'planned',
  complete = 'complete',
  process = 'process',
  drop = 'drop',
  hide = 'hide'
}

export const STATUS_LIST: Status[] = [
  {
    name: 'Запланировано',
    status: StatusList.planned,
  },
  {
    name: 'Просмотрено',
    status: StatusList.complete,
  },
  {
    name: 'Смотрю',
    status: StatusList.process,
  },
  {
    name: 'Брошено',
    status: StatusList.drop,
  },
  {
    name: 'Скрыть',
    status: StatusList.hide,
  },
  {
    name: 'Нет',
    status: null,
  },
];
