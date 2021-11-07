import { ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LibraryService } from '../../../services/library.service';
import { Status } from '../../../../models';
import { MatSelectChange } from '@angular/material/select';
import { FileCab } from '@shared/services/file-cab';

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
  statusList: Status[];

  constructor(
    private libraryService: LibraryService,
    private changeDetector: ChangeDetectorRef,
    private fileCab: FileCab,
  ) {
    this.statusList = this.fileCab.statusList;
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
