import { Item } from '@server/models/base';
import { MetaData } from '@server/models/meta-data';
import { Anime } from '@server/models/anime';
import { Film } from '@server/models/films';
import { Tag } from './tag';
import { LibraryItem } from '../../../../server/src/library/interface';

export interface LibraryItemOld<T extends Item> extends MetaData {
  item: T;
}

export interface ISchema {
  func?: string;
  title?: string;
  type: string;
}

export type ItemType = Anime | Film;

export interface UserData {
  id: number;
  email: string;
  token: string;
}

export interface LibrarySettings {
  user?: UserData
  enableSync?: boolean;
}

export interface Library {
  tags: Tag[];
  data: Record<string, LibraryItem[]>;
  lastTimeUpdate: number;
}

export interface LibraryOld {
  tags: Tag[];
  data: Record<string, LibraryItemOld<ItemType>[]>;
  lastTimeUpdate: number;
}
