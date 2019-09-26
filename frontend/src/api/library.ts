import { Item } from '../../../server/src/api';

export interface Library {
  sections: LibrarySection[];
}

export interface LibrarySection {
  key: string;
  list: LibraryItem[];
}

export interface LibraryItem extends Item {
  comment: string;
  tags: number[];
}

export interface Tag {
  name: string;
  id: number;
}
