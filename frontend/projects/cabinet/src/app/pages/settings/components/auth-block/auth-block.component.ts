import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '@shared/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { extractError, getErrorMessage, getFormErrors } from '@shared/utils/get-form-errors';
import { takeUntil } from 'rxjs/operators';
import { FileCabService } from '@shared/services/file-cab.service';
import { Observable, Subject } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LibrarySettings } from '@shared/models/library';

@UntilDestroy()
@Component({
  selector: 'app-auth-block',
  templateUrl: './auth-block.component.html',
  styleUrls: ['./auth-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthBlockComponent {
  authForm = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });
  fields = {
    email: 'Email',
    password: 'Password',
  };
  changeIndexEvent$ = new Subject<number>();
  settings$: Observable<LibrarySettings> = this.fileCabService.settings$;

  constructor(
    private userService: UserService,
    private matSnackBar: MatSnackBar,
    private fileCabService: FileCabService,
  ) {
  }

  tabChange({ index }: { index: number }): void {
    this.changeIndexEvent$.next(index);
  }

  auth(): void {
    const errors = getFormErrors(this.authForm);
    if (errors) {
      this.notification(getErrorMessage(errors, this.fields));
      return;
    }

    this.userService.login(this.authForm.getRawValue()).pipe(
      takeUntil(this.changeIndexEvent$),
      untilDestroyed(this),
    ).subscribe(
      () => {
        this.notification('Успешная авторизация');
      },
      error => {
        this.notification(extractError(error, {
          notFound: 'Логин или пароль не верны',
        }));
      },
    );
  }

  logout(): void {
    this.userService.logout().subscribe(
      () => this.notification('Вы успешно разлогинены, синхронизация приостановлена'),
      error => this.notification(extractError(error)),
    );
  }

  sync(): void {
    this.fileCabService.sendUpdateStoreEvent();
    this.notification('Обновление поставлено в очередь');
  }

  load(): void {
    this.fileCabService.sendLoadStoreEvent();
    this.notification('Запущенно обновление');
  }

  resetPassword(): void {
    this.userService
      .resetPassword(this.authForm.getRawValue().email)
      .subscribe();
  }

  registration(): void {
    const errors = getFormErrors(this.authForm);
    if (errors) {
      this.notification(getErrorMessage(errors, this.fields));
      return;
    }

    this.userService.registration(this.authForm.getRawValue()).pipe(
      takeUntil(this.changeIndexEvent$),
      untilDestroyed(this),
    ).subscribe(
      () => {
        this.notification('Успешная регистрация');
      },
      error => {
        this.notification(extractError(error, {
          userExisted: 'Данный юзер уже зарегистрирован, авторизуйтесь, или сбросьте пароль',
        }));
      },
    );
  }

  toggleSync(enableSync: boolean, settings: LibrarySettings): void {
    this.fileCabService.updateSettings({
      ...settings,
      enableSync,
    });
  }

  private notification(message: string): void {
    this.matSnackBar.open(message, undefined, {
      duration: 3000,
    });
  }

}
