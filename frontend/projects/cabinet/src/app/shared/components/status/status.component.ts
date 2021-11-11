import { ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LibraryService } from '../../../services/library.service';
import { MatSelectChange } from '@angular/material/select';
import { Status } from '@shared/models/status-item';
import { STATUS_LIST } from '@shared/const';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StatusComponent), multi: true },
  ],
})
export class StatusComponent implements ControlValueAccessor {
  @Input() value: string;
  @Output() onUpdate = new EventEmitter<string>();

  onChange?: (status: string) => void;
  statusList: Status[] = STATUS_LIST;

  constructor(
    private libraryService: LibraryService,
    private changeDetector: ChangeDetectorRef,
  ) {
  }

  writeValue(status: string): void {
    this.value = status;
    setTimeout(() => {
      this.changeDetector.markForCheck();
    });
  }

  registerOnChange(fn: (status: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  handleChange(event: MatSelectChange): void {
    this.value = event.value;

    if (this.onChange)
      this.onChange(event.value);

    this.onUpdate.emit(this.value);
  }

}
