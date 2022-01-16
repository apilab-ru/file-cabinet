import { FormGroup } from '@angular/forms';
import * as isEqual from 'lodash/isEqual';
import { ERROR_MESSAGES, FORM_LIBRARY_FIELDS } from '@shared/const/form-library';
import { CustomError } from '@shared/utils/custom-error';

type FormErrors = Record<string, Record<string, boolean>>;

export function getFormErrors(form: FormGroup): Record<string, Record<string, boolean>> | null {
  const errors = Object.keys(form.controls).reduce((obj, key) => {
    if (form.get(key).errors) {
      obj[key] = form.get(key).errors;
    }
    return obj;
  }, {});

  return isEqual(errors, {}) ? null : errors;
}

export function getErrorMessage(errors: FormErrors, fields: Record<string, string>): string {
  let error = '';
  Object.entries(errors).forEach(([key, info]) => {

    error
      += fields[key]
      + ' '
      + Object.keys(info).map(key => FORM_LIBRARY_FIELDS[key]()).join(', ')
      + ';\r\n';
  });
  return error;
}

export function extractError(error: CustomError, messages: Record<string, string> = {}): string {
  const all = { ...ERROR_MESSAGES, ...messages };
  return all[error.message] || error.message;
}
