import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-stars',
  template: `
    <span class="star"
          *ngFor="let star of list"
          [class.selected]="(currentStar$ | async) >= star"
          [class.hovered]="(hoveredStar$ | async) >= star"
          (click)="selectStar(star)"
          (mouseenter)="onHover(star)"
    ></span>
    <span class="counter">{{ (currentStar$ | async) || 0 }} / 10</span>
  `,
  styleUrls: ['stars.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StarsComponent), multi: true },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StarsComponent implements ControlValueAccessor {
  @Input() set star(star: number) {
    this.currentStar$.next(star);
  };

  @Output() setStars = new EventEmitter<number>();

  list = Array.from(Array(10).keys()).map(item => ++item);
  currentStar$ = new BehaviorSubject<number>(0);
  hoveredStar$ = new BehaviorSubject<number>(0);

  private onChange?: (star: number) => void;

  @HostListener('mouseleave') onMouseLeave(): void {
    this.hoveredStar$.next(0);
  }

  writeValue(star: number): void {
    this.currentStar$.next(star);
  }

  registerOnChange(fn: (star: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  onHover(star: number): void {
    this.hoveredStar$.next(star);
  }

  selectStar(star: number): void {
    this.currentStar$.next(star);
    this.setStars.emit(star);

    if (this.onChange) {
      this.onChange(star);
    }
  }

  checkSelected(star: number): boolean {
    return star <= this.star;
  }

}
