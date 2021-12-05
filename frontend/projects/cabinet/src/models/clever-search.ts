import { STATUS_LIST } from '@shared/const';

export const BASE_CLEVER_SEARCH_KEYS = {
  genres: {
    name: 'жанр',
    list: [],
  },
  years: {
    name: 'года',
  },
  /*tags: {
    name: 'теги',
    list: [],
  },*/
  ratingFrom: {
    name: 'рейтингОт',
  },
  ratingTo: {
    name: 'рейтингДо',
  },
  status: {
    name: 'статус',
    list: STATUS_LIST.map(item => ({ name: item.name, id: item.status })),
  },
};

export enum SearchKeys {
  genres = 'genres',
  years = 'years',
  tags = 'tags',
  ratingFrom = 'ratingFrom',
  ratingTo = 'ratingTo',
  status = 'status'
}

export interface ISearchStatus {
  search: string;
  options: ICleverSearchValues;
}

export type ICleverSearchKeys = {
  [key in keyof typeof SearchKeys]?: {
    name: string;
    list?: ICleverSearchKey[];
  };
}

export type ICleverSearchKey = {
  name: string;
  id: number | string;
}

export type ICleverSearchValues = {
  [key in keyof typeof SearchKeys]?: ISearchValue[];
}

export interface ISearchValue {
  positive: boolean,
  value: string | number
}
