import { Component, Input, Output, EventEmitter, AfterViewInit, OnChanges, DoCheck, ElementRef } from '@angular/core';
declare let require: (any);
declare let $: (any);
declare var window: any;

@Component({
    selector: 'timepicker',
    templateUrl: './timepicker.component.html',
    styleUrls : ['./timepicker.component.scss']
})
export class TimepickerComponent {
  public _ = require('../../../../../node_modules/lodash');
  @Input() value: any = null;
  @Input() cssClass: string = '';
  @Output() valueChange: EventEmitter<any> = new EventEmitter<any>();
  timepickerId = this._.uniqueId('timepicker-');

  constructor(private elementRef: ElementRef) { }

  ngAfterViewInit() {
    this.elementRef.nativeElement.querySelector('input').onchange = () => {
        let value = this.elementRef.nativeElement.querySelector('input').value;
        this.valueChange.emit(value);
    };
  }
  /**
   * Set focus on timepicker input
   */
  setFocus() {
    let input = <HTMLInputElement>document.getElementById(this.timepickerId);
    if (input) {
      input.focus();
    }
  }
}
