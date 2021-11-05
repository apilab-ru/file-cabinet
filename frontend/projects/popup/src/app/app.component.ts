import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { FileCab } from '@shared/services/file-cab';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  statuses = this.fileCab.statusList;
  types$ = this.fileCab.config$.pipe(
    map(({ types }) => types),
  );

  constructor(
    private fileCab: FileCab,
  ) {
  }
}
