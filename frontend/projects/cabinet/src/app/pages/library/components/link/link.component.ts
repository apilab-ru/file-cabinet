import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-link',
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkComponent {
  name: string;

  @Input()
  set link(link: string) {
    this._link = link;
    this.name = this.getName(link);
  }

  get link(): string {
    return this._link;
  }

  private _link: string;

  private getName(link: string): string {
    const host = link.split('/')[2];
    return host;
  }
}
