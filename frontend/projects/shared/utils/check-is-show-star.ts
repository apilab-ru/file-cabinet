import { StatusList } from '@shared/const/const';

export function checkIsShowStar(status: StatusList | null | string): boolean {
  return ['complete', 'process', 'drop'].includes(status);
}
