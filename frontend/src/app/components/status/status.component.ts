import { ChangeDetectorRef, Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LibraryService } from '../../services/library.service';
import { Status } from '@cab/api';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StatusComponent), multi: true },
  ]
})
export class StatusComponent implements ControlValueAccessor {

  value: string;
  onChange: (status: string) => void;
  statusList: Status[];

  constructor(
    private libraryService: LibraryService,
    private changeDetector: ChangeDetectorRef,
  ) {
    this.libraryService
      .getStatusList()
      .then(list => this.statusList = list);
  }

  writeValue(status: string): void {
    this.value = status;
    setTimeout(() => {
      this.changeDetector.markForCheck();
    });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

}
