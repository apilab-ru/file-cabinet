import { StatusItem } from './models/status-item';
export const STATUS_LIST: StatusItem[] = [
  {
    name: 'Запланировано',
    status: 'planned'
  },
  {
    name: 'Просмотренно',
    status: 'complete'
  },
  {
    name: 'Смотрю',
    status: 'process'
  },
  {
    name: 'Брошенно',
    status: 'drop'
  },
  {
    name: 'Скрыть',
    status: 'hide'
  }
];
