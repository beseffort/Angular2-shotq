import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
declare let require: (any);

@Component({
  selector: 'form-field-datepicker',
  templateUrl: 'form-field-datepicker.component.html',
  styleUrls: ['form-field-datepicker.component.scss'],
})
export class FormFieldDatepickerComponent {

  @Input() label: string;
  @Input() floating: boolean;
  @Input() placeholder: string;
  @Input() errors: Array<any>;
  @Input() cssClass: string;
  @Input() disabled: boolean;
  @Input() required: boolean;

  @Input('ngValue') value: string;
  @Output('ngValueChange') valueChange: EventEmitter<string> = new EventEmitter<string>();

  public _ = require('../../../../../node_modules/lodash');
  public isDropdownOpen = false;
  public isOpened = false;
  public cleared = false;
  public inputId: string = this._.uniqueId('form-field-');

  @HostListener('document:keydown', ['$event'])
    keydown(e: KeyboardEvent) {
        if (e.key === 'Escape' && this.isOpened) {
          this.isDropdownOpen = false;
          this.isOpened = false;
        }
    }

  /**
   * handle when a date is selected from the calendar
   * @param {[type]} value [description]
   */
  onChange(value) {
    this.valueChange.emit(value);
    this.value = value;
    this.isDropdownOpen = false;
    this.isOpened = false;
  }

  /**
   * Clear the input value and selected date
   */
  clear() {
    this.value = null;
    this.valueChange.emit(this.value);
    this.isOpened = false;
    this.cleared = true;
  }

  /**
   * return the errors if any
   * @param {[type]} inputRef [description]
   */
  getErrors(inputRef) {
    return (this.required && this.isOpened && !inputRef.valid) ?
      (this.errors || []).concat(['Required']) :
      this.errors;
  }

  /**
   * Handle when the calendar is displayed
   * Set the control variables to handle the component behaviour
   * @param {[type]} $event [description]
   */
  openCalendar($event) {
    if (this.cleared) {
      this.isOpened = false;
    } else {
      this.isOpened = true;
    }
    this.cleared = false;
  }
}
