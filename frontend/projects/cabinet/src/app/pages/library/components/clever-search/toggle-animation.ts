import { animate, style, transition, trigger } from '@angular/animations';

const toggleTime = '300ms';

export const toggleAnimation = trigger('showTrigger', [
  transition(':enter', [
    style({ opacity: 0, height: 0 }),
    animate(toggleTime, style({ opacity: 1, height: '*' })),
  ]),
  transition(':leave', [
    animate(toggleTime, style({ opacity: 0, height: 0 })),
  ]),
]);
