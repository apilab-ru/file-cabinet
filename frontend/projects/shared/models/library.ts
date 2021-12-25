import { Item } from '@server/models/base';
import { MetaData } from './meta-data';
import { Anime } from '@server/models/anime';
import { Film } from '@server/models/films';
import { Tag } from './tag';

export interface LibraryItem<T extends Item> extends MetaData {
  item: T;
}

export interface ISchema {
  func?: string;
  title?: string;
  type: string;
}

export type ItemType = Anime | Film;

export interface LibrarySettings {

}

export interface Library {
  tags: Tag[];
  data: Record<string, LibraryItem<ItemType>[]>;
  settings: LibrarySettings;
}
