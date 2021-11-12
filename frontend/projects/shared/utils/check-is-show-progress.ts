import { StatusList } from '@shared/const';

export function checkIsShowProgress(status: StatusList | null | string): boolean {
  return [StatusList.process, StatusList.drop].includes(status as StatusList);
}
