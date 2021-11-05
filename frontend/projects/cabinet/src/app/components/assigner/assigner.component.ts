import { Component, EventEmitter, Output } from '@angular/core';
import { NavigationService } from '../../services/navigation.service';
import { Observable } from 'rxjs';
import { NavigationItem } from '../../../api';

@Component({
  selector: 'app-assigner',
  templateUrl: './assigner.component.html',
  styleUrls: ['./assigner.component.scss'],
})
export class AssignerComponent {

  @Output() assign = new EventEmitter<string>();

  get structList$(): Observable<NavigationItem[]> {
    return this.navigationService.getStruct();
  }

  constructor(
    private navigationService: NavigationService,
  ) {
  }

  toStruct(patch: string): void {
    this.assign.next(patch);
  }

}
