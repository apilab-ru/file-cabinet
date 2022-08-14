import { MetaData } from '@server/models/meta-data';
import { MediaCompareData } from '@shared/models/media-compare';

export interface ParserSendRequest<T> {
  data: T;
  callback: (arg?: any) => void;
}

export interface ParserResponse extends MediaCompareData {
  name: string;
  type?: string;
  meta?: MetaData;
}

export interface ParserPreset {
  domain: string;
  host: RegExp | '*';
  func: () => ParserResponse[];
  messageHost?: string;
}
