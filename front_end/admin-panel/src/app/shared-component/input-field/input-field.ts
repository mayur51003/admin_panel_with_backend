import { Component, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-input-field',
  imports: [CommonModule, FormsModule],
  templateUrl: './input-field.html',
  styleUrl: './input-field.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputField),
      multi: true,
    },
  ],
})
export class InputField implements ControlValueAccessor, OnChanges {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: 'text' | 'number' | 'email' | 'password' | 'date' | 'textarea' = 'text';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() rows: number = 4;
  @Input() dateStyles: any = null;
  @Input() maxLength: number | null = null;
  @Input() minValue: number | null = null;

  @Input() showValidation: boolean = false;
  @Input() resetTrigger: boolean = false;

  private _value: any = '';
  private _touched: boolean = false;

  get hasError(): boolean {
    const shouldShowError = this._touched || this.showValidation;
    return shouldShowError && this.required && this.isEmpty(this._value);
  }

  get errorMessage(): string {
    if (this.hasError) {
      if (this.type === 'email' && this._value && !this.isValidEmail(this._value)) {
        return 'Please enter a valid email address';
      }
      return `${this.label || 'This field'} is required`;
    }
    return '';
  }

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showValidation'] && changes['showValidation'].currentValue) {
      this._touched = true;
    }

    if (changes['resetTrigger']) {
      this._touched = false;
      this._value = '';
    }
  }

  get value(): any {
    return this._value;
  }

  set value(val: any) {
    if (val !== this._value) {
      this._value = val;
      this.onChange(val);
    }
  }

  writeValue(value: any): void {
    this._value = value !== null && value !== undefined ? value : '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(newValue: any): void {
    this.value = newValue;
  }

  onBlur(): void {
    this._touched = true;
    this.onTouched();
  }

  private isEmpty(value: any): boolean {
    return (
      value === null ||
      value === undefined ||
      value === '' ||
      (typeof value === 'string' && value.trim() === '')
    );
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
