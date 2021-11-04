import {
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'app-stars',
  template: `
    <span class="star" *ngFor="let star of list"
          (mouseenter)="onHover(star)"
          [class.selected]="checkSelected(star)"
          [class.hovered]="checkHovered(star)"
          (click)="selectStar(star)"></span>
    <span class="counter">{{ star }} / 10</span>
  `,
  styleUrls: ['stars.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class StarsComponent {

  list = Array.from(Array(10).keys()).map(item => ++item);

  @Output() setStars = new EventEmitter<number>();
  @Input() star = 0;

  private hoveredStar = 0;

  @HostListener('mouseleave') onMouseLeave(): void {
    this.hoveredStar = 0;
  }

  onHover(star: number): void {
    this.hoveredStar = star;
  }

  selectStar(star: number): void {
    this.star = star;
    this.setStars.emit(star);
  }

  checkHovered(star): boolean {
    return star <= this.hoveredStar;
  }

  checkSelected(star: number): boolean {
    return star <= this.star;
  }

}
