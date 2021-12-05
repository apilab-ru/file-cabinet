import { Injectable } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { Breakpoint, BreakpointSize } from '../../models/breakpoint';
import { distinctUntilChanged, map, shareReplay, startWith } from 'rxjs/operators';

interface Size {
  key: Breakpoint;
  size: number;
}

@Injectable({
  providedIn: 'root',
})
export class BreakpointsService {
  private sizes: Size[] = Object.entries(BreakpointSize)
    .map(([key, size]) => ({ key: key as Breakpoint, size }));

  breakpoint$: Observable<Breakpoint>;
  isMobile$: Observable<boolean>;

  constructor() {
    this.breakpoint$ = fromEvent(window, 'resize').pipe(
      startWith(true),
      map(() => this.checkForWindowResize()),
      distinctUntilChanged(),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    this.isMobile$ = this.breakpoint$.pipe(
      map(breakpoint => breakpoint === Breakpoint.mobile),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  checkIsMobile(): boolean {
    return this.checkForWindowResize() === Breakpoint.mobile;
  }

  private checkForWindowResize(): Breakpoint {
    const size = window.innerWidth;

    return this.sizes.find(item => item.size <= size).key;
  }
}
