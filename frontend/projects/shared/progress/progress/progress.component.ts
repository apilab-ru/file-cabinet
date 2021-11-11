import { ChangeDetectionStrategy, Component, forwardRef, Input } from '@angular/core';
import { ItemType } from '@shared/models/library';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ProgressComponent), multi: true },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressComponent implements ControlValueAccessor {
  @Input() item?: ItemType;
  @Input() value: number = 0;

  private onChange?: (value: number) => void;

  writeValue(value: number): void {
    this.value = value;
  }

  updateValue(value: number): void {
    if (this.onChange)
      this.onChange(++value || 0);
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
  }
}
