import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormFieldComponent } from '../form-field/form-field.component';
import { FormFieldWrapComponent } from '../form-field-wrap';
declare let require: (any);

@Component({
  selector: 'form-field-textarea',
  templateUrl: 'form-field-textarea.component.html'
})
export class FormFieldTextareaComponent extends FormFieldComponent {
  public _ = require('../../../../../node_modules/lodash');
  @Input() label: string;
  @Input() floating: boolean;
  @Input() placeholder: string;
  @Input() errors: Array<any>;
  @Input() cssClass: string;
  @Input() disabled: boolean;
  @Input() required: boolean;
  @Input() rows: number;

  @Input('ngValue') value: string;
  @Output('ngValueChange') valueChange: EventEmitter<string> = new EventEmitter<string>();

  textGroupId: string = this._.uniqueId('text-group-');

  // Override parent class implementation
  ngOnInit() {
    this.rows = this.rows || 4;
  }

  /**
   * Add "focused" class to input group when input has focus
   */
  addSelectedClass() {
    let textGroup = document.getElementById(this.textGroupId);
    textGroup.classList.add('input-group-focused');
  }
  /**
   * Remove "focused" class to input group when input has focus
   */
  removeSelectedlass() {
    let textGroup = document.getElementById(this.textGroupId);
    textGroup.classList.remove('input-group-focused');
  }
  /**
   * Set focus on text area when span is clicked
   */
  focusTextArea() {
    let textArea = document.getElementById(this.textGroupId);
     if (textArea) {
       textArea.focus();
     }
  }
}
