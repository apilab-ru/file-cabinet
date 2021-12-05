import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  template$ = new BehaviorSubject<TemplateRef<any> | null>(null);

  setTemplate(template: TemplateRef<any>): void {
    this.template$.next(template);
  }
}
