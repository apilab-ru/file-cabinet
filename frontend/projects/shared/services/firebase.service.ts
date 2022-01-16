import { Observable } from 'rxjs';
import { FirebaseApp, initializeApp } from '@firebase/app';
import { Database, getDatabase, ref, onValue, off } from '@firebase/database';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export class FirebaseService {
  private app$: Observable<FirebaseApp>;
  private db$: Observable<Database>;

  constructor() {
    this.app$ = new Observable<FirebaseApp>(subject => {
      const app = initializeApp(environment.firebase);
      subject.next(app);
    }).pipe(
      shareReplay(1),
    );

    this.db$ = this.app$.pipe(
      map(app => getDatabase(app)),
    ).pipe(
      shareReplay(1),
    );
  }

  selectData<T>(path: string): Observable<T> {
    return this.db$.pipe(
      switchMap(db => this.listenValue<T>(path, db)),
    );
  }

  private listenValue<T>(path: string, db: Database): Observable<T> {
    const starCountRef = ref(db, path);

    return new Observable<T>(subject => {
      onValue(starCountRef, (snapshot) => {
        const data = snapshot.val();
        subject.next(data);
      }, error => subject.error(error));

      return () => off(starCountRef);
    });
  }

}
