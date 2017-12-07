import { Component, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ValidationService } from './validation.service';


@Component({
  selector: 'validation-messages',
  template: `
    <div *ngIf="errorMessage || errors.length">
      <span>{{ errorMessage }}</span>
      <span *ngFor="let error of errors">{{ error }}</span>
    </div>
  `
})
export class ValidationMessagesDirective {
  @Input() control: FormControl;
  @Input() showWhen: boolean = null;
  @Input() errors = [];
  @Input() messages: {[key: string]: string};

  constructor() {
  }

  get errorMessage() {
    if (!this.control)
      return;

    for (let propertyName in this.control.errors) {
      if (this.control.errors.hasOwnProperty(propertyName) && (this.showWhen === null ? this.control.touched : this.showWhen)) {
        if (this.messages && Object.keys(this.messages).indexOf(propertyName) !== -1) {
          return this.messages[propertyName];
        }
        return ValidationService.getValidatorErrorMessage(propertyName, this.control.errors[propertyName]);
      }
    }

    return null;
  }
}
