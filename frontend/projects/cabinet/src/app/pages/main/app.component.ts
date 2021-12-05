import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MENU_ITEMS } from '../../routing/menu-items';
import { LayoutService } from '../../services/layout.service';
import { BreakpointsService } from '../../services/breakpoints.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly navLinks = MENU_ITEMS;

  template$ = this.layoutService.template$.asObservable();
  isMobile$ = this.breakpointService.isMobile$;

  constructor(
    private layoutService: LayoutService,
    private breakpointService: BreakpointsService,
  ) {
  }
}
