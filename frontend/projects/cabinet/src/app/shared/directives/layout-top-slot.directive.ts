import { Directive, Input, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { LayoutService } from '../../services/layout.service';

@Directive({
  selector: '[appLayoutTopSlot]',
})
export class LayoutTopSlotDirective implements OnInit, OnDestroy {
  @Input() appLayoutTopSlot: TemplateRef<any>;

  constructor(
    private layoutService: LayoutService,
  ) {
  }

  ngOnInit(): void {
    this.layoutService.setTemplate(this.appLayoutTopSlot);
  }

  ngOnDestroy(): void {
    this.layoutService.setTemplate(null);
  }

}
