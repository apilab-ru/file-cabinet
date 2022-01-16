import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

class NotificationsService {
  private notifications$ = new BehaviorSubject<string[]>([]);

  addMessage(message: string): void {
    this.notifications$.next([
      ...this.notifications$.getValue(),
      message,
    ]);
  }

  readMessages(): Observable<string> {
    return this.notifications$.pipe(
      filter(list => !!list.length),
      map(list => {
        const message = list.pop();
        this.notifications$.next(list);
        return message;
      }),
    );
  }
}

export const notificationsService = new NotificationsService();
