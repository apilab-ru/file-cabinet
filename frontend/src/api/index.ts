/// <reference types="chrome"/>
import { Anime, Film, Item } from '../../../server/src/api';

export * from '../../../server/src/api';
export * from './navigation';

declare global {
  interface Window {
    chrome: typeof chrome;
  }
}

export interface LibraryItem<T extends Item> {
  item: T;
  tags?: string[];
  status?: string;
  url?: string;
}

export interface ISchema {
  func: string;
  title?: string;
  type: string;
}

export type ItemType = Anime | Film;

export interface Library {
  tags: string[];
  data: {[key: string]: LibraryItem<ItemType>[]};
}
export interface Status {
  name: string;
  status: string;
}
