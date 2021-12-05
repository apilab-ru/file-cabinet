import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FileCabService } from '@shared/services/file-cab.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBoxComponent {
  @Input() form: FormGroup;

  types$ = this.fileCabService.types$;

  constructor(
    private fileCabService: FileCabService,
  ) {
  }

  selectType(type: string): void {
    this.form.patchValue({ type });
  }

}
