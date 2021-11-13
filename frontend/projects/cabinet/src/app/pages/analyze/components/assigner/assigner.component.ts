import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { structList } from 'projects/cabinet/src/app/routing/routes';

@Component({
  selector: 'app-assigner',
  templateUrl: './assigner.component.html',
  styleUrls: ['./assigner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignerComponent {
  @Output() assign = new EventEmitter<string>();

  structList = structList;

  toStruct(patch: string): void {
    this.assign.next(patch);
  }
}
