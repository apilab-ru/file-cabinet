import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, map } from 'rxjs/operators';
import {
  BASE_CLEVER_SEARCH_KEYS,
  ICleverSearchKey,
  ICleverSearchKeys,
  ISearchStatus,
  ISearchValue,
} from '../../../../../models';
import { KeyListenerService } from '../../../../services/key-listener.service';
import { MatFormField } from '@angular/material/form-field';

@Component({
  selector: 'app-clever-search',
  templateUrl: './clever-search.component.html',
  styleUrls: ['./clever-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CleverSearchComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() keys: ICleverSearchKeys = BASE_CLEVER_SEARCH_KEYS;

  @Input() status: ISearchStatus;
  @Output() statusChanges = new EventEmitter<ISearchStatus>();

  @ViewChild(MatFormField, { static: true }) private field: MatFormField;

  isShowAdvanced = false;
  separator = '?';
  inputControl = new FormControl();
  debounceTime = 500;

  private isIgnoreHover = false;

  constructor(
    private keyListenerService: KeyListenerService,
    private ngZone: NgZone,
  ) {
  }

  ngOnInit(): void {
    this.inputControl
      .valueChanges
      .pipe(
        map(value => this.parseString(value)),
        debounceTime(this.debounceTime),
      )
      .subscribe(value => {
        this.statusChanges.emit(value);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.keys && !changes.keys.firstChange) {
      const data = this.parseString(this.inputControl.value);
      const stringData = this.renderValue(data);
      if (stringData !== this.inputControl.value) {
        this.inputControl.patchValue(stringData);
      }
    }

    if (changes.status || changes.keys) {
      if (!deepEqual(this.parseString(this.inputControl.value), this.status)) {
        this.inputControl.patchValue(this.renderValue(this.status));
      }
    }
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.field._elementRef.nativeElement.onmouseover = () => {
        if (!this.isShowAdvanced && !this.isIgnoreHover) {
          this.ngZone.run(() => {
            this.isShowAdvanced = true;
          });
        }
      };
    });
  }

  toggle(): void {
    this.isShowAdvanced = !this.isShowAdvanced;
    this.isIgnoreHover = true;
    setTimeout(() => {
      this.isIgnoreHover = false;
    }, 3000);
  }

  setSection(key: string): void {
    this.initStatus();
    if (this.status?.options[key]) {
      delete this.status.options[key];
    } else {
      // @ts-ignore
      this.status.options[key] = [];
    }
    this.inputControl.patchValue(this.renderValue(this.status), { emitEvent: false });
    this.statusChanges.emit(this.status);
  }

  isSectionSelected(key: string): boolean {
    return this?.status?.options && this.status.options[key];
  }

  selectValue(key: string, value: string | never): void {
    this.initStatus();
    if (!this.status?.options[key]) {
      // @ts-ignore
      this.status.options[key] = [];
    }
    const index = this.status.options[key].findIndex(it => it.value === value);
    if (index !== -1) {
      this.status.options[key].splice(index, 1);
      if (this.status.options[key]?.length === 0) {
        delete this.status.options[key];
      }
    } else {
      if (!this.keyListenerService.isAltPressed() && !this.keyListenerService.isCtrlPressed()) {
        // @ts-ignore
        this.status.options[key] = [{ positive: true, value }];
      } else {
        this.status.options[key].push({ value, positive: this.keyListenerService.isCtrlPressed() });
      }
    }
    this.inputControl.patchValue(this.renderValue(this.status), { emitEvent: false });
    this.statusChanges.emit(this.status);
  }

  isValueSelected(key: string, value: string | never): boolean {
    return this.status
      && this.status.options
      && this.status.options[key]
      && this.status.options[key].find(it => it.value === value);
  }

  clear(): void {
    this.status = null;
    this.inputControl.patchValue('');
    this.statusChanges.emit(null);
  }

  private initStatus(): void {
    if (!this.status) {
      this.status = {
        search: '',
        options: {},
      };
    }
  }

  private renderValue(status: ISearchStatus): string {
    if (!status || !this.keys) {
      return '';
    }
    const options = [];
    let result = status.search;
    if (status.options) {
      for (let key in status.options) {
        const name = this.keys[key]?.name;
        const list = this.keys[key]?.list;

        if (name) {
          options.push(`?${name}=` + status.options[key].map(it => this.searchValue(it, list)).join(','));
        }
      }
      result += ' ' + options.join(' ');
    }
    return result;
  }

  private searchValue(it: ISearchValue, list?: ICleverSearchKey[]): string {
    const found = list?.find(item => item.id === it.value);
    return found ? (it.positive ? '' : '!') + found.name : '';
  }

  private parseString(value: string): ISearchStatus {
    if (!value) {
      return null;
    }
    const list = value.split(this.separator);

    const search = [];
    const options = {};
    list.forEach(item => {
      const isSearchString = !item.includes('=');
      if (isSearchString) {
        search.push(item);
      } else {
        let [key, value] = item.split('=');
        key = this.convertKey(key);
        options[key] = this.parserValues(key, value || '');
      }
    });

    for (let key in options) {
      if (!this.keys[key]) {
        delete options[key];
      }
    }

    const result = {
      search: search.join(' ').trim(),
      options,
    };
    return result;
  }

  private convertKey(key: string): string {
    const keys = Object.keys(this.keys);
    const keyCompare = key.toLocaleLowerCase();
    for (let i = 0; i < keys.length; i++) {
      if (keyCompare === this.keys[keys[i]].name.toLocaleLowerCase()) {
        return keys[i];
      }
    }
    return key;
  }

  private parserValues(key: string, valueString: string): { positive: boolean, value: string | number }[] {
    const list = valueString.split(',');
    return list.map(value => {
      let positive = true;
      if (value.substr(0, 1) === '!') {
        positive = false;
        value = value.substr(1);
      }
      return {
        positive,
        value: this.convertValue(key, value),
      };
    });
  }

  private convertValue(key: string, value: string): string | number {
    value = value.replace(/\+/g, ' ').toLocaleLowerCase().trim();
    if (this.keys[key] && this.keys[key].list) {
      const found = this.keys[key].list.find(it => it.name.toLocaleLowerCase() === value.toLocaleLowerCase());
      return found ? found.id : value;
    }
    return isNaN(+value) ? value : +value;
  }

}

function deepEqual(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}
