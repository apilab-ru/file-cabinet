import { Directive, ElementRef, HostListener, Input, NgZone } from '@angular/core';

@Directive({
  selector: '[appHorizontalScroll]',
})
export class HorizontalScrollDirective {
  @Input() isEnabled = true;

  constructor(
    private element: ElementRef,
    private ngZone: NgZone,
  ) {
  }

  @HostListener('wheel', ['$event'])
  public onScroll(event: WheelEvent) {
    if (!this.isEnabled) {
      return;
    }

    event.preventDefault();
    this.ngZone.runOutsideAngular(() => {
      this.element.nativeElement.scrollLeft += event.deltaY;
    });
  }
}
