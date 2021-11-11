import { Item } from '@server/api/base';
import { MetaData } from './meta-data';
import { Anime } from '@server/api/anime';
import { Film } from '@server/api/films';
import { Tag } from './tag';

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
  tags: Tag[];
  data: Record<string, LibraryItem<ItemType>[]>;
}
