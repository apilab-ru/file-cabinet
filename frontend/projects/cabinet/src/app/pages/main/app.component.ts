import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MENU_ITEMS } from '../../routing/menu-items';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly navLinks = MENU_ITEMS;
}
