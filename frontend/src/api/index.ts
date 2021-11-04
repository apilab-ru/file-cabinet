/// <reference types="chrome"/>
import { Anime, Film, Item } from '../../../server/src/api';

export * from '../../../server/src/api';
export * from './navigation';
export * from './library';
export * from './i-clever-search';
export * from './utils';
export * from './status-list';

declare global {
  interface Window {
    chrome: typeof chrome;
  }
}

export interface MetaData {
  tags?: string[];
  status?: string;
  url?: string;
  star?: number;
  comment?: string;
  progress?: number;
  founded?: boolean;
}

export interface LibraryItem<T extends Item> extends MetaData {
  item: T;
}

export interface ISchema {
  func: string;
  title?: string;
  type: string;
}

export type ItemType = Anime | Film;

export interface Library {
  tags: { name: string, id: number }[];
  data: { [key: string]: LibraryItem<ItemType>[] };
}

export interface Status {
  name: string;
  status: string;
}
