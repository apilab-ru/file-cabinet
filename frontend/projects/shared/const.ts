import { StatusItem } from './models/status-item';

export enum StatusList {
  planned = 'planned',
  complete = 'complete',
  process = 'process',
  drop = 'drop',
  hide = 'hide'
}

export const STATUS_LIST: StatusItem[] = [
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
  }
];
