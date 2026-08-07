import { Component, input, forwardRef, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="form-group">
      @if (label()) {
        <label class="form-label" [for]="inputId()">{{ label() }}</label>
      }
      @if (prefix()) {
        <div class="input-wrapper">
          <span class="input-prefix">{{ prefix() }}</span>
          <input
            [id]="inputId()"
            class="form-input"
            [class.error]="error()"
            [type]="type()"
            [placeholder]="placeholder()"
            [value]="value()"
            (input)="onInput($event)"
            (blur)="onBlur()"
          />
        </div>
      } @else {
        <input
          [id]="inputId()"
          class="form-input"
          [class.error]="error()"
          [type]="type()"
          [placeholder]="placeholder()"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onBlur()"
        />
      }
      @if (error()) {
        <span class="form-error">{{ error() }}</span>
      }
      @if (hint() && !error()) {
        <span class="form-hint">{{ hint() }}</span>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputFieldComponent),
      multi: true,
    },
  ],
})
export class InputFieldComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly placeholder = input('');
  readonly type = input('text');
  readonly error = input('');
  readonly hint = input('');
  readonly prefix = input('');
  readonly inputId = input(`input-${Math.random().toString(36).slice(2, 9)}`);

  private _value = signal('');
  readonly value = this._value.asReadonly();

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this._value.set(val);
    this.onChange(val);
  }

  onBlur() {
    this.onTouched();
  }

  writeValue(val: string): void {
    this._value.set(val ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Could implement disabled state if needed
  }
}
