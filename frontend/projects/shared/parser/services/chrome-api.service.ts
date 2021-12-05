/// <reference types="chrome"/>
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ParserActions } from '@shared/parser/const';
import { ParserSendRequest } from '@shared/parser/interface';

declare global {
  interface Window {
    chrome: typeof chrome;
  }
}

@Injectable({
  providedIn: 'root',
})
export class ChromeApiService {
  onMessage<T>(key: ParserActions): Observable<ParserSendRequest<T>> {
    return new Observable<ParserSendRequest<T>>(resolve => {
      window.chrome.runtime.onMessage.addListener((request, sender, callback) => {

        if (request.key === key) {
          resolve.next({
            data: request.data,
            callback,
          });
        }
      });
    });
  }
}
