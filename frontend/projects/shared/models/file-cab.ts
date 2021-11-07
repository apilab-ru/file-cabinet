import { ISchema, Status } from '../../cabinet/src/models';

export interface IFileCab {
  getStatusList: () => Promise<Status[]>;
  initedData: Promise<{schemas: ISchema[], types}>;
  reload: () => Promise<{schemas: ISchema[], types}>;
}
