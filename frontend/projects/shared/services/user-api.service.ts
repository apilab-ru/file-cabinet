import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { fetchObservable } from '@shared/utils/fetch-observable';
import { AuthParams, UserResponse } from '@server/models';
import { Library } from '@shared/models/library';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {

  registration(form: AuthParams): Observable<UserResponse> {
    return fetchObservable(`user/registration`, 'POST', form);
  }

  login(form: AuthParams): Observable<UserResponse> {
    return fetchObservable(`user/auth`, 'POST', form);
  }

  resetPassword(email: string): Observable<void> {
    return fetchObservable(`user/resetPassword`, 'POST', { email });
  }

  logout(token: string): Observable<void> {
    return fetchObservable(`user/logout`, 'POST', { token }, token);
  }

  getUserInfo(token: string): Observable<UserResponse> {
    return fetchObservable(`user/me`, 'GET', undefined, token);
  }

  postLibrary(token: string, store: Library): Observable<void> {
    return fetchObservable('user-library/list', 'POST', store, token);
  }

  loadLibrary(token: string): Observable<Library> {
    return fetchObservable('user-library/list', 'GET', undefined, token);
  }
}

export const userApiService = new UserApiService();
