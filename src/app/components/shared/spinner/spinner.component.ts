import { Component, OnInit, forwardRef, Input, ElementRef, Renderer, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { isUndefined } from 'util';

@Component({
  selector: 'app-spinner',
  templateUrl: 'spinner.component.html',
  styleUrls: ['spinner.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SpinnerComponent),
      multi: true,
    }],
  // encapsulation: ViewEncapsulation.Native
})
export class SpinnerComponent implements OnInit, ControlValueAccessor {
  @Input() step: number = 1;
  @Input() minValue: number;
  @Input() maxValue: number;

  _value: number;


  constructor(private el: ElementRef, private _renderer: Renderer) {
  }

  ngOnInit() {
  }

  onChange: any = () => { };

  onTouched: any = () => { };

  get value() {
    return this._value;
  }

  set value(val) {
    if (this._value !== val) {
      this._value = val;
      this.onChange(val);
      this.onTouched();
    }
  }

  ngOnDestroy() {
  }

  toggleDropdown() {
  }

  writeValue(value: any) {
    if (!isUndefined(value)) {
      this._value = value;
      // this.value = value;
    }
  }

  ngOnChanges() {
  }

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  canSpin(delta: number): boolean {
    if (delta < 0 && this.minValue) {
      return this.value + delta >= this.minValue;
    } else if (delta > 0 && this.maxValue) {
      return this.value + delta <= this.maxValue;
    }
    return true;
  }

  spin(delta, e) {
    e.preventDefault();
    e.stopPropagation();

    if (this.canSpin(delta))
      this.value = this.value + delta;
  }

  private propagateChange = (_: any) => { };

}
