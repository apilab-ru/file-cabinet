import { MetaData } from '@shared/models/meta-data';

export interface ParserSendRequest<T> {
  data: T;
  callback: (arg?: any) => void;
}

export interface ParserResponse {
  name: string;
  type?: string;
  id?: number;
  meta?: MetaData;
}

export interface ParserPreset {
  domain: string;
  host: RegExp | '*';
  func: () => ParserResponse[];
  messageHost?: string;
}
