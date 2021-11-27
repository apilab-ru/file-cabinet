import * as cloneDeep from 'lodash/cloneDeep';

export function deepCopy<T>(obj: T): T {
  return cloneDeep(obj);
}
