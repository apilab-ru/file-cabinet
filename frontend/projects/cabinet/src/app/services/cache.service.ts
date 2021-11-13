import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { take } from 'rxjs/operators';

const EXPIRED = 60 * 60 * 24 * 30;

interface CacheSubject<T> {
  timeLive: number;
  callback: CacheCallback<T>;
}

interface CacheItem<T> {
  data: ReplaySubject<T>;
  timeExpired: number;
}

type CacheCallback<T> = (params?: any) => Observable<T>;

@Injectable({
  providedIn: 'root',
})
export class CacheService {

  private cacheSubjectMap = new Map<string, CacheSubject<any>>();
  private dataMap = new Map<string, CacheItem<any>>();

  register<T>(name: string, callback: CacheCallback<T>, timeLive = EXPIRED): void {
    this.cacheSubjectMap.set(name, {
      callback,
      timeLive,
    });
  }

  get<T>(name: string, params?: any): Observable<T> {
    const key = this.getHash(name, params);
    const now = this.getTime();
    const result = this.dataMap.get(key);

    if (result && now - result.timeExpired > now) {
      return result.data.pipe(take(1));
    }

    const cacheSubject = this.cacheSubjectMap.get(name);
    const result$ = new ReplaySubject<T>(1);

    this.dataMap.set(key, {
      data: result$,
      timeExpired: now + cacheSubject.timeLive,
    });

    cacheSubject
      .callback(params)
      .subscribe(
        data => result$.next(data),
        error => {
          result$.error(error);
          result$.complete();
          this.dataMap.set(key, null);
        },
      );

    return result$.asObservable()
      .pipe(take(1));
  }

  clear(name: string, params?: any): void {
    const key = this.getHash(name, params);
    this.dataMap.set(key, null);
  }

  private getHash(name: string, params?: any): string {
    return name + (params ? JSON.stringify(params) : '');
  }

  private getTime(): number {
    return Math.ceil(new Date().getTime() / 1000);
  }

}
