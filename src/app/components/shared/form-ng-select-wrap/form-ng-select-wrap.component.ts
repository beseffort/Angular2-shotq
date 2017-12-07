import { Component, Input, ViewChild, AfterViewInit, Output, OnChanges, ElementRef, EventEmitter } from '@angular/core';
declare let require: (any);

@Component({
  selector: 'form-ng-select-wrap',
  templateUrl: 'form-ng-select-wrap.component.html',
  styleUrls: ['form-ng-select-wrap.component.scss']
})
export class FormNgSelectWrapComponent implements AfterViewInit, OnChanges {
  public _ = require('../../../../../node_modules/lodash');
  @Input() label: string;
  @Input() floating: boolean;
  @Input() errors: Array<any>;
  @Input() value: any;
  @Input() disabled: boolean;
  @Output() click = new EventEmitter();

  @ViewChild('wrapperDiv') wrapperRef: ElementRef;

  isFocused: boolean = false;
  hasValue: any = false;

  wrapper: HTMLDivElement;
  selectContainer: HTMLElement;
  input: HTMLInputElement;
  /**
   * [ngAfterViewInit description]
   */
  ngAfterViewInit() {
    this.wrapper = this.wrapperRef.nativeElement;
    this.input = <HTMLInputElement>this.wrapper.querySelector('ng-select input');
    this.selectContainer = document.getElementById('select-container');

    this.input.addEventListener('focus', () => {
      this.isFocused = true;
      this.selectContainer.classList.add('select-contact-focused');
    });

    this.input.addEventListener('blur', (ev: any) => {
      this.isFocused = false;
      this.selectContainer.classList.remove('select-contact-focused');
       if (ev.relatedTarget === null || ev.relatedTarget.className !== 'ui-select-choices-row-inner') {
          // remove .open class
          if (this.selectContainer !== undefined && this.selectContainer !== null) {
            let cssClass = 'open';
            this.selectContainer.className = this.selectContainer.className.replace(new RegExp(' ?\\b' + cssClass + '\\b'), '');
          }
        }
      setTimeout(() => this.checkEmpty());
    });
  }
  /**
   * [ngOnChanges description]
   * @param {[type]} changes [description]
   */
  ngOnChanges(changes) {
    if (this.selectContainer && this.input) {
      if (this.disabled) {
        this.selectContainer.setAttribute('disabled', '');
        this.input.setAttribute('disabled', '');
      } else {
        this.selectContainer.removeAttribute('disabled');
        this.input.removeAttribute('disabled');
      }
      this.checkEmpty();
    }
  }
  /**
   * [checkEmpty description]
   */
  private checkEmpty(): void {
    this.hasValue = (!this._.isEmpty(this.value) || this.input.value);
  }

  private onClick(e: any) {
    this.click.emit(e);
  }
}
