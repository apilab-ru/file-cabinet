import { Observable } from 'rxjs';
import { AbstractControl } from '@angular/forms';
import { startWith } from 'rxjs/operators';

export function fromFormControl<T>(formControl: AbstractControl): Observable<T> {
  return formControl.valueChanges.pipe(
    startWith(formControl.value),
  );
}
