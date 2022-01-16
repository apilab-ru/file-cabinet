import { ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MediaItem } from '@server/models';

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
  @Input() item?: MediaItem;
  @Input() value: number = 0;
  @Output() valueChane = new EventEmitter<number>();

  private onChange?: (value: number) => void;

  writeValue(value: number): void {
    this.value = value;
  }

  updateValue(value: number): void {
    if (this.onChange) {
      this.onChange(+value || 0);
    }

    this.valueChane.emit(+value || 0);
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
  }
}
