import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

interface StoreMethods<T> {
  select: () => Observable<T>
}

type StoreFields<T> = { [key in keyof T]: BehaviorSubject<T[key]> };
export type RecordSubject<T> = StoreFields<T> & StoreMethods<T>;

export function makeStore<T>(data: T): RecordSubject<T> {
  const store = {} as StoreFields<T>;
  for (let key in data) {
    // @ts-ignore
    store[key] = new BehaviorSubject<typeof data[typeof key]>(data[key]);
  }
  const keys = Object.keys(data);

  const subjects = [];
  Object.values(store).forEach((subject, index) => {
    subjects.push((subject as BehaviorSubject<any>).pipe(
      startWith(data[keys[index]]),
    ));
  });

  (store as RecordSubject<T>).select = () => combineLatest(subjects).pipe(
    map((list) => {
      return keys.reduce((obj, key, index) => {
        obj[key] = list[index];
        return obj;
      }, {}) as T;
    }),
    startWith(data),
  );
  return store as RecordSubject<T>;
}
