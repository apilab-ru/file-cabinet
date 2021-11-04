import { Inject, Injectable, NgZone } from '@angular/core';
import { DOCUMENT } from '@angular/common';

const KEY_CTRL = 'Control';
const KEY_ALT = 'Alt';

@Injectable({
  providedIn: 'root'
})
export class KeyListenerService {

  private pressedKeyMap = new Map<string, boolean>();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private ngZone: NgZone,
  ) {
    this.initListeners();
  }

  isAltPressed(): boolean {
    return !!this.pressedKeyMap.get(KEY_ALT);
  }

  isCtrlPressed(): boolean {
    return !!this.pressedKeyMap.get(KEY_CTRL);
  }

  private initListeners(): void {
    this.ngZone.runOutsideAngular(() => {
      this.document.addEventListener('keydown', (event) => {
        this.pressedKeyMap.set(event.key, true);
      });

      this.document.addEventListener('keyup', (event) => {
        this.pressedKeyMap.set(event.key, false);
      });
    })
  }
}
