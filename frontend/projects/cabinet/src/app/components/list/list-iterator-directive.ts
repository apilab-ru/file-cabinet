import { Directive, Input, TemplateRef, TrackByFunction } from '@angular/core';

export interface RowContext<T> {
  $implicit: T;
}

@Directive({
  selector: '[listIterator][listIteratorOf]'
})
export class ListIteratorDirective<T> {

  @Input() listIterator: TrackByFunction<T>;

  @Input() listIteratorOf: T[];

  constructor(public template: TemplateRef<RowContext<T>>) {
  }

}
