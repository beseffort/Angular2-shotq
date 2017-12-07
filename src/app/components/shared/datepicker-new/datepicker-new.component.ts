import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnChanges, DoCheck, SimpleChanges, ElementRef } from '@angular/core';
import { GeneralFunctionsService }  from '../../../services/general-functions';
import { IMyOptions, MyDatePicker, IMyDate } from 'mydatepicker';
/* Services */
import { FlashMessageService } from '../../../services/flash-message';
declare let require: (any);

@Component({
    selector: 'datepicker-new',
    templateUrl: './datepicker-new.component.html',
    styleUrls : ['./datepicker-new.component.scss']
})
export class DatePickerNewComponent {
  @Input() data: Object = { };
  @Input() idBlock: string = (+new Date).toString(36);
  @Input() label: string = '';
  @Input() addClass: string = '';
  @Input() options: IMyOptions = {
    dateFormat: 'mm/dd/yyyy',
    showTodayBtn: false,
    showSelectorArrow: false,
    minYear: 1900,
    maxYear: 2050
    };
  @Input() getConfirm: boolean = false;
  @Input() showDeleteIcon: boolean = true;
  @Output() dataChange = new EventEmitter();
  @Output() onDelete: EventEmitter<any> = new EventEmitter<any>();
  @Output() changeInvalidDate: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('datepicker') datepicker: MyDatePicker;
  @ViewChild('inputField') inputField: ElementRef;

  public _ = require('lodash');
  inputId: string = this._.uniqueId('datepicker-');
  private alertify = require('../../../assets/theme/assets/vendor/alertify-js/alertify.js');
  private onCheck: boolean = false;
  private myDateContainer: HTMLElement;
  private myDateInput: HTMLElement;
  private dateString: string = '';
  private dateStringFormatted: string = '';
  private functions;
  private moment;
  private hasFocus: boolean = false;
  private cursorPosition: number;
  private dateFromChildDatepicker: boolean = false;
  private invalidDate: boolean = false;
  private containerFound: boolean = false;
  private dateFromInput: boolean = false;

  constructor(private generalFunctions: GeneralFunctionsService) {
    this.functions = generalFunctions;
    this.moment = generalFunctions.getMomentJS();
  }

  ngOnInit() {
    this.options.inline = false;
    this.options.showInputField = false;
    this.options.showClearDateBtn = false;
    this.options.minYear = 1900;
    this.options.maxYear = 2050;
    if (!this.options.dateFormat) {
      this.options.dateFormat = 'mm/dd/yyyy';
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    for (let propName in changes) {
      if (propName === 'data' && !this.dateFromChildDatepicker) {
        if (this.data !== undefined && this.data['date'] !== undefined) {
          let dateString = this.data['date'].year + '/' + this.data['date'].month + '/' + this.data['date'].day;
          let formats = this.functions.getDateValidFormats();
          if (this.moment(dateString, formats, true).isValid()) {
            this.dateStringFormatted = this.moment(dateString, formats, true).format(this.options.dateFormat.toUpperCase());
          }
          this.setDateString();
        } else if (this.dateFromChildDatepicker) {
          this.dateFromChildDatepicker = false;
        }
      }
    }
  }

  ngAfterViewInit() {
    window['scrollAnimate'] = function(element, position) {
        if (element && position) {
          let scrollPosTop = element.scrollTop;
          let posElement = position.getBoundingClientRect().top;
          if (posElement > 0) {
              let newPosition = scrollPosTop + 70;
              element.scrollTop = newPosition;
              setTimeout(() => {
                  window['scrollAnimate'](element, position);
              }, 1);
          } else {
              element.scrollTop = element.scrollTop + position.getBoundingClientRect().top;
          }
        }
    };
    this.myDateContainer = document.getElementById('date-picker-new-' + this.idBlock);
    if (this.myDateContainer) {
      this.containerFound = true;
      let myDate_inputs = document.getElementById('date-picker-new-' + this.idBlock).getElementsByTagName('input');
      if (myDate_inputs[1]) {
        this.myDateInput = myDate_inputs[1];
        if (this.label !== '') {
          this.myDateInput.setAttribute('id', 'input-' + this.idBlock);
          let labelAnniversary = <HTMLElement> document.querySelector('#date-picker-new-' + this.idBlock + ' .input-group-addon label');
          labelAnniversary.setAttribute('for', 'input-' + this.idBlock);
        }
      }
    }
    this.onCheck = true;
  }

  ngDoCheck() {
    if (!this.containerFound && document.getElementById('date-picker-new-' + this.idBlock)) {
      this.ngAfterViewInit();
    }
  }

  /**
   * Emit event when date has changed
   * @param {date} date [new date]
   */
  dateChanged(date) {
    this.dateFromChildDatepicker = true;
    if (date['epoc'] === 0) {
        this.data = {};
        this.dataChange.emit();
    } else {
        this.data = date;
        this.dataChange.emit(date);
    }
    this.dateStringFormatted = date.formatted;
    if (!this.dateFromInput) {
      this.invalidDate = false;
    } else {
      this.dateFromInput = !this.dateFromInput;
    }
    if (!this.hasFocus) {
      this.hideDatepicker();
    }
  }
  /**
   * Handle user input event
   * @param {any} e [input event]
   */
  inputChange(e: any) {
    if (e.target) {
      let dateString = e.target.value;
      let formats = this.functions.getDateValidFormats();
      let date = undefined;
      if (this.moment(dateString, formats, true).isValid()) {
        date = this.moment(dateString, formats, true);
        let auxString = date.format('YYYY-MM-DD');
        this.invalidDate = !this.moment(auxString).isBetween('1900-01-01', '2050-12-31', null, '[]');
      } else if (dateString.trim() !== '') {
        this.invalidDate = true;
        this.changeInvalidDate.emit({ref: this});
      }
      // set the flag to check on dateChanged() if the date comes from input value
      this.dateFromInput = true;
      if (date !== undefined && !this.invalidDate) {
        this.dateFromInput = true;
        let aux: IMyDate = {
          year: date['_d'].getFullYear(),
          month: date['_d'].getMonth() + 1,
          day: date['_d'].getDate(),
        };
        this.data = {
          date: aux
        };
        this.datepicker.selectDate(aux);
        this.datepicker.setVisibleMonth();
      } else {
        this.data = {};
        this.datepicker.clearDate();
      }
      // set flag to false after date change
      this.dateFromInput = false;
    }
  }
  /**
   * Blur event handler
   * Hide the datepicker
   * @param {any} e [description]
   */
  inputBlur(e: any) {
     this.hasFocus = false;
     if (e.relatedTarget) {
       let relatedTarget: any = e.relatedTarget.className;
       // Check if the click was inside of the calendar
       let calendarClasses = ['headerbtn', 'headerlabelbtn', 'selector', 'daycell'];
       let clickInside = false;
       for (let c of calendarClasses) {
         if (relatedTarget.indexOf(c) !== -1) {
           clickInside = true;
           break;
         }
       }
       if (!clickInside) {
        this.hideDatepicker();
        if (e.target.value.trim() === '') {
          this.datepicker.clearDate();
          this.onDelete.emit(null);
          this.clearDate({});
        }
        if (this.invalidDate) {
          this.clearDate({});
          this.setDateString();
        }
      }
   }
  }
  /**
   * Handle focus event
   * @param {any} e [description]
   */
  inputFocus(e: any) {
    this.hasFocus = true;
    this.showDatepicker();
  }
  /**
   * When span is clicked, its field is focused
   * @param {any} e [description]
   */
  onSpanClick(e: any) {
    let input: any = document.getElementById(this.inputId);
    if (input) {
      input.focus();
    }
  }
  /**
   * Clear the selected date
   * @param {[type]} $event [description]
   */
  clearDate(e: any, confirm?) {
    if (confirm) {
      let $this = this;
      this.alertify.confirm(
         'Are you sure that you want to perform this action? It is not reversible.',
         () => {
            this.dateStringFormatted = '';
            this.datepicker.clearDate();
            this.hideDatepicker();
            this.setDateString();
            this.onDelete.emit(null);
            });
      }else {
          this.dateStringFormatted = '';
          this.datepicker.clearDate();
      }
  }
  setDate(date: any) {
    if (date !== undefined && date['date'] !== undefined) {
      let dateString = date['date'].year + '/' + date['date'].month + '/' + date['date'].day;
      let formats = this.functions.getDateValidFormats();
      if (this.moment(dateString, formats, true).isValid()) {
          this.dateStringFormatted = this.moment(dateString, formats, true).format(this.options.dateFormat.toUpperCase());
      }
      this.setDateString();
    } else if (this.dateFromChildDatepicker) {
        this.dateFromChildDatepicker = false;
    }
  }
  /**
   * set the date to be displayed in the input field
   */
  private setDateString() {
    if (!this.invalidDate) {
      this.dateString = this.dateStringFormatted;
      this.inputField.nativeElement.value = this.dateString;
    } else {
      this.dateStringFormatted = '';
      this.dateString = '';
      this.inputField.nativeElement.value = '';
    }
  }
  /**
   * Use the inline property of the mydatepicker component to
   * display the calendar
   * Add the custom classes to proper display of the inputs
   */
  private showDatepicker() {
    if (document.querySelectorAll('#date-picker-new-' + this.idBlock + ' div.selector').length === 0 ) {
        this.myDateContainer.classList.add('datepicker-open');
        let elementScroll = document.querySelector('.container-2');
        let elementPosition = document.querySelector('.datepicker-open');
        window['scrollAnimate'](elementScroll, elementPosition);
    }
    let aux = this._.cloneDeep(this.options);
    aux.inline = true;
    this.options = {};
    this.options = aux;
  }
  /**
   * Hide the calendar setting the inliner property of
   * mydatepicker component
   */
  private hideDatepicker() {
    let aux = this._.cloneDeep(this.options);
    aux.inline = false;
    this.options = {};
    this.options = aux;
    document.querySelector('#date-picker-new-' + this.idBlock).classList.remove('datepicker-open');
    this.hasFocus = false;
    if (this.invalidDate === false) {
      this.setDateString();
    }
  }
}
