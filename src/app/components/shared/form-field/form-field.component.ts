import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  DoCheck,
  OnChanges,
  HostListener,
  AfterViewInit,
  SimpleChanges
}                                                     from '@angular/core';
import { DecimalPipe }                                from '@angular/common';
import { FormFieldWrapComponent }                     from '../form-field-wrap';
import { GeneralFunctionsService }                     from '../../../services/general-functions/general-functions.service';

declare let require: (any);

@Component({
  selector: 'form-field',
  templateUrl: 'form-field.component.html',
  styleUrls: ['./form-field.component.scss']
})
export class FormFieldComponent implements OnInit {
  public _ =                                           require('../../../../../node_modules/lodash');
  @Input() label:                                      string = '';
  @Input() auxLabel:                                   string = '';
  @Input() floating:                                   boolean;
  @Input() placeholder:                                string;
  @Input() errors:                                     Array<any> = [];
  @Input() cssClass:                                   string;
  @Input() disabled:                                   boolean = false;
  @Input() required:                                   boolean = false;
  @Input() type:                                       string;
  @Input() step:                                       string;
  @Input() min:                                        string;
  @Input() max:                                        string = '99999';
  @Input() plugin:                                     string;
  @Input() onlyLetters:                                boolean = false;
  @Input() nameField:                                  boolean = false;
  @Input() auxname:                                    string = undefined; // used on form field address to validate fields
  @Input() showDelete:                                 boolean = false;
  @Input() isLoading:                                  boolean = false;
  @Input() showPrimary:                                boolean = false;
  @Input() withSelect:                                 boolean = false;
  @Input() options:                                    Array<any> = [];
  @Input() spanWithSelect:                             boolean = false;
  @Input() withInput:                                  boolean = true;
  @Input() onlySelect:                                 boolean = false;
  @Input() roundDecimal:                               boolean = false;
  @Input() hideIcon:                                   boolean = false;
  @Input() truncateWords:                              string;
  @Input() truncateOptionWords:                        string;
  @Input('ngValue') public value:                      string;
  @Input('ngSelectValue') public selectValue:          string;
  @Output('ngSelectValueChange') public selectValueChange: EventEmitter<any> = new EventEmitter<any>();
  @Output('ngValueChange') public valueChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() onDelete: EventEmitter<any> = new EventEmitter<any>();
  @Output() onBlur: EventEmitter<any> = new EventEmitter<any>();

  inputId:                      string = this._.uniqueId('form-field-');
  spanId:                       string = this._.uniqueId('span-');
  buttonId:                     string = this._.uniqueId('drop-down-button-');
  inputGroupId:                 string = this._.uniqueId('input-group-');
  dropDownGroupId:              string = this._.uniqueId('drop-down-group-');
  listId:                       string = this._.uniqueId('drop-down-list-');

  listEl:                       HTMLElement;

  private selectedOptionName:   string  = '';
  private isOpen:               boolean = false;
  private buttonFocused:        boolean;
  private searchText:           string = '';
  private isFocused:            boolean = false;
  private tempLabel:            string  = '';
  private phoneMaskPattern:     any = /^([0-9-()+. ]*)$/g;
  private notFormatPhone:       string = '';

  constructor(private decimalPipe: DecimalPipe, private generalFunctionsService: GeneralFunctionsService) {}

  ngOnInit() {
    this.type = this.type || 'text';
    this.mapOptionId(this.selectValue);

    // Check if label has a '*'
    let idx = this.label.indexOf('*');
    this.tempLabel = this._.cloneDeep(this.label);
    if (idx > -1) {
      this.tempLabel = this.label.slice(0, idx);
    }
  }
  /**
   * Function executed only when an input changes.
   */
  ngOnChanges(changes: SimpleChanges) {
    if (this.selectValue !== undefined) {
      this.mapOptionId(this.selectValue);
    } else {
      this.selectedOptionName = '';
    }
    for (let propName in changes) {
      if (changes.hasOwnProperty(propName))  {
        let chng = changes[propName];
        let cur  = JSON.stringify(chng.currentValue);
        let prev = JSON.stringify(chng.previousValue);
        if ((this.label === 'Phone' || this.label === 'phone') && propName === 'value') {
          if ((prev === undefined || prev === '{}') && this.value !== undefined) {
            this.notFormatPhone = this.value;
            this.value = this.generalFunctionsService.formatPhone(this.value);
          }
        }
      }
    }
  }
  ngAfterViewInit() {
    this.listEl = document.getElementById(this.listId);
    if (this.listEl) {
      this.listEl.addEventListener('keydown', (ev: KeyboardEvent) => {
        if (ev.which >= 65 && ev.which <= 90) {
          let letter = String.fromCharCode(ev.which);
          this.searchText += letter.toString();
          this.searchOption(this.searchText);
        }
      });
    }
  }
  /**
   * Search first option when key is pressed
   * @param {number} key [key code pressed]
   */
  searchOption(text: string) {
    this.searchText = '';
    let formatedText = text.slice(0, 1) + text.slice(1).toLowerCase();
    if (this.options && this.options.length) {
      for (let i = 0; i < this.options.length; i++) {
        if (String(this.options[i].name).indexOf(formatedText) === 0) {
          let option = document.getElementById(this.listId + '-' + this.options[i].id);
          option.focus();
          break;
        }
      }
    }
  }
  /**
   * Get option by Id
   * @param {number} id [description]
   */
  mapOptionId(id: any) {
    if (id && id !== undefined) {
      if (this.options !== undefined) {
        for (let i = 0; i < this.options.length; i++) {
          if (this.options[i].id === id || String(this.options[i].id) === id || String(this.options[i].id) === String(id)) {
            this.selectedOptionName = this.options[i].name;
            break;
          }
        }
      }
    } else if (this.options && this.options[0]) {
      this.selectedOptionName = this.options[0].name;
    }
  }
  /**
   * Open/close the dropdown list
   */
  toggleOpen() {
    this.isOpen = !this.isOpen;
    let dropDownContainer = document.getElementById(this.dropDownGroupId);
    if (dropDownContainer) {
      if (this.isOpen) {
        dropDownContainer.classList.add('open');
        this.addSelectedClass();
        let dropDown = document.getElementById(this.listId);
        if (dropDown) {
          dropDown.focus();
        }
      } else {
        dropDownContainer.classList.remove('open');
        if (document.activeElement.id !== this.inputId && document.activeElement.id !== this.buttonId) {
          this.removeSelectedClass();
        }
      }
    }
  }
  /**
   * Value changed event
   * @param {[type]} value [description]
   */
  onChange(value) {
    // if the new value is inside the valid range update the value
    if (this.type === 'number' && (parseFloat(this.value) > parseFloat(this.max)) && (parseFloat(this.value) < parseFloat(this.min))) {
      this.valueChange.emit(this.value);
    } else {
      this.valueChange.emit(value);
    }
  }
  /**
   * Selected value changed on dropdown list
   * @param {[type]} optionId [id from selected option]
   */
  onSelectChange(optionId) {
    this.toggleOpen();
    this.onSpanClick();
    this.selectValueChange.emit(optionId);
  }

  /**
   * When span is clicked, its field is focused
   * @param {string} type [element type to set focus on]
   */
  onSpanClick(type?: string) {
     if (type !== undefined && type === 'selector') {
       this.toggleOpen();
     } else {
       let input = document.getElementById(this.inputId);
       if (input) {
         input.focus();
       }
     }
  }

  /**
   * Remove focused style from dropdown div
   */
  removeFocusStyle() {
    window.setTimeout(() => {
        if (this.isOpen) {
          if (document.activeElement.id !== this.listId && document.activeElement.tagName !== 'LI') {
            this.toggleOpen();
          }
        } else {
          if (document.activeElement.id !== this.inputId) {
            this.removeSelectedClass();
          }
        }
      }, 115
    );
  }

  /**
   * Get errors
   * @param {[type]} inputRef [description]
   */
  getErrors(inputRef) {
    return (inputRef && this.required && inputRef.touched && !inputRef.valid) ?
      (this.errors || []).concat(['The above field is required. Please, enter ' + this.tempLabel]) :
      this.errors;
  }
  /**
   * Get errors from parent component
   */
  getErrorsFromParent() {
    this.errors = [];
    if (this.required && (this.value === '' || this.value === undefined)) {
      this.errors.push('The above field is required. Please, enter ' + this.tempLabel);
    }
    if (this.type === 'email' && this.value !== undefined && this.value !== '') {
      this.validateEmail();
    }
    if (this.label.indexOf('Phone') > -1 && this.value !== undefined && this.value !== '') {
      this.validatePhone();
    }
    if (this.onlyLetters && this.value !== undefined && this.value !== '') {
      this.validateLetters();
    }
    if (this.nameField && this.value !== undefined && this.value !== '') {
      this.validateName();
    }
    if (this.type === 'web' && this.value !== undefined && this.value !== '') {
      this.validateWeb();
    }
    if (this.errors.length > 0) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * Check if value is a valid email
   */
  validateEmail() {
    if (!this.value.match('[A-Za-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)' +
      '+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)')) {
      this.errors.push('Please, enter a valid Email');
      return false;
    } else {
      return true;
    }
  }
  /**
   * Check if value is a valid phone
   */
  validatePhone() {
    let validPhone: Array<string>|null = this.value.match(this.phoneMaskPattern);
    if (validPhone === null) {
      this.errors.push('Please, enter a valid Phone');
      return false;
    } else {
      return true;
    }
  }
  /**
   * Check if value is a valid web
   */
  validateWeb() {
    let pattern =
    /(.*\.(net|com|org|gov|mil|int|pro|travel|tel|biz|info|mobi|name|aero|jobs|museum|coop|tv|cc|ws|co|NET|COM|ORG|GOV|MIL|INT|PRO|TRAVEL|TEL|BIZ|INFO|MOBI|NAME|AERO|JOBS|MUSEUM|COOP|TV|CC|WS|CO)($|\..*|\/.*))/g;
    let exp = new RegExp(pattern);
    if (exp.test(this.value)) {
        let web: string = this.value;
        if (!(web.substring(0, 7) === 'http://' || web.substring(0, 8) === 'https://')) {
          let url = 'http://' + web;
          this.value = url;
        }
        return true;
      } else {
        this.errors.push('Please, enter a valid Web site');
        return false;
      }
  }
  /**
   * Check if value has only letters
   */
  validateLetters() {
    let exp = new RegExp(/^[!-/:-ÿ\s\']*$/g);
    if (!exp.test(this.value)) {
      this.errors.push('Please, enter a valid ' + this.tempLabel);
      return false;
    } else {
      return true;
    }
  }
  validateName() {
    if (!this.generalFunctionsService.validateName(this.value)) {
      this.errors.push('Please, enter a valid ' + this.tempLabel + '. These characters are not allowed: ~ # % & * { } \\ : < > ? / + | "');
      return false;
    } else {
      return true;
    }
  }
  /**
   * Add "focused" class to input group when input has focus
   */
  addSelectedClass() {
    this.isFocused = true;
    let inputGroup = document.getElementById(this.inputGroupId);
    if (inputGroup && inputGroup.classList) {
      inputGroup.classList.add('input-group-focused');
      // format phone
      if (this.label === 'Phone' || this.label === 'phone') {
        // Format phone if string has only numbers
        if (/^\d+$/.test(this.notFormatPhone)) {
          this.value = this.notFormatPhone;
        }
      }
    }
  }
  /**
   * Remove "focused" class to input group when input has focus
   */
  removeSelectedClass(e?: any, aux?) {
    let inputGroup = document.getElementById(this.inputGroupId);
    if (inputGroup && inputGroup.classList) {
      inputGroup.classList.remove('input-group-focused');
      if (!this.spanWithSelect && !this.auxname) {
        this.onBlur.emit(e);
        this.getErrorsFromParent();
      }
    }
    // format phone
    if (this.label === 'Phone' || this.label === 'phone') {
      this.notFormatPhone = this.value;
      this.value = this.generalFunctionsService.formatPhone(this.value);
    }
  }
  /**
   * Emit event when delete icon is pressed
   */
  valueDeleted(e: any) {
    this.getErrorsFromParent();
    this.onDelete.emit(e);
    this.onSpanClick();
  }

  inputNumberBlur(e: any) {
    this.removeSelectedClass();
    if (this.roundDecimal) {
      e.target.value = this.truncateDecimal(e.target.value);
      this.valueChange.emit(e.target.value);
    }
  }
  /**
   * round the input value to 2 decimal places
   * @param {string} value [description]
   */
  private truncateDecimal(value: string) {
    if (value !== '') {
      value = this.decimalPipe.transform(value, '1.2-2');
      // Get thousand separator
      let aux = 1000.00;
      let stringNumber = aux.toLocaleString();
      let thousandSeparator = stringNumber[1];
      // check if is not a number, should be ',' or '.'
      let reg = new RegExp('^[0-9]$');
      if (!reg.test(thousandSeparator)) {
        // remove thousand separator from string value to prevent input number error
        // input allow only decimal separator
        switch (thousandSeparator) {
          case ',':
            value = value.replace(/[ ]*,[ ]*|[ ]+/g, '');
            break;
          case '.':
            value = value.replace(/[ ]*.[ ]*|[ ]+/g, '');
            break;
          default:
            break;
        }
      }
    }
    return value;
  }
  /**
   * Handle input on input event
   * @param {any} e [description]
   */
  private inputHandler(e: any) {
    let value = e.target.value;
    if (parseFloat(value) > parseFloat(this.max)) {
      e.target.value = this.max;
      this.value = this.max;
    }
    if (parseFloat(value) < parseFloat(this.min)) {
      e.target.value = this.min;
      this.value = this.min;
    }
  }
}
