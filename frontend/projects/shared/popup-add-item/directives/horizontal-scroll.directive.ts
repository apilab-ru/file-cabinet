import { Directive, ElementRef, HostListener, NgZone } from '@angular/core';

@Directive({
  selector: '[appHorizontalScroll]',
})
export class HorizontalScrollDirective {
  constructor(
    private element: ElementRef,
    private ngZone: NgZone,
  ) {
  }

  @HostListener('wheel', ['$event'])
  public onScroll(event: WheelEvent) {
    event.preventDefault();
    this.ngZone.runOutsideAngular(() => {
      this.element.nativeElement.scrollLeft += event.deltaY;
    });
  }
}
