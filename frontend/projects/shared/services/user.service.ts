import { Injectable, NgZone } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { AuthParams, UserResponse } from '@server/models';
import { runInZone } from '@shared/utils/run-in-zone';
import { userApiService } from '@shared/services/user-api.service';
import { FileCabService } from '@shared/services/file-cab.service';
import { LibrarySettings } from '@shared/models/library';
import { map, switchMap, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private settings$: Observable<LibrarySettings>;

  constructor(
    private ngZone: NgZone,
    private fileCabService: FileCabService,
  ) {
    this.settings$ = this.fileCabService.settings$;
  }

  login(params: AuthParams): Observable<UserResponse> {
    return combineLatest([
      this.loginApi(params),
      this.settings$.pipe(take(1)),
    ]).pipe(
      map(([user, settings]) => {
        this.fileCabService.updateSettings({
          ...settings,
          user,
        });

        return user;
      }),
    );
  }

  registration(params: AuthParams): Observable<UserResponse> {
    return combineLatest([
      userApiService.registration(params),
      this.settings$.pipe(take(1)),
    ]).pipe(
      map(([user, settings]) => {
        this.fileCabService.updateSettings({
          ...settings,
          user,
        });

        return user;
      }),
      runInZone(this.ngZone),
    );
  }

  resetPassword(email: string): Observable<void> {
    return userApiService.resetPassword(email).pipe(
      runInZone(this.ngZone),
    );
  }

  logout(): Observable<void> {
    return this.settings$.pipe(
      take(1),
      switchMap(settings => userApiService.logout(settings.user.token).pipe(
        tap(() => {
          delete settings.user;
          this.fileCabService.updateSettings(settings);
        }),
      )),
      runInZone(this.ngZone),
    );
  }

  loadLibrary() {
  }

  private loginApi(params: AuthParams): Observable<UserResponse> {
    return userApiService.login(params).pipe(
      runInZone(this.ngZone),
    );
  }
}
