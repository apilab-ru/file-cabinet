import { OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

export class Destructible implements OnDestroy {

  destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
