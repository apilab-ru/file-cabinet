import { Observable } from 'rxjs';

export class ChromeStoreApi {

  onStoreChanges<T>(): Observable<Partial<T>> {
    return new Observable<Partial<T>>((resolve) => {
      chrome.storage.onChanged.addListener(result => {
        const updates: Partial<T> = Object.keys(result)
          .reduce((obj, key) => ({ ...obj, [key]: result[key].newValue }), {});

        resolve.next(updates);
      });
    });
  }

  setStore<T>(store: T): Promise<void> {
    return chrome.storage.local.set(store);
  }

  getStore<T>(): Observable<T> {
    return new Observable<T>((resolve) => {
      chrome.storage.local.get((res) => {
        resolve.next(res as undefined as T);
      });
    });
  }

  setGlobalStorage<T>(data: T): Promise<void> {
    return chrome.storage.sync.set(data);
  }

  getGlobalStorage<T>(): Observable<T> {
    return new Observable<T>((resolve) => {
      chrome.storage.sync.get(null, (result: T) => {
        resolve.next(result);
      });
    });
  }

}
