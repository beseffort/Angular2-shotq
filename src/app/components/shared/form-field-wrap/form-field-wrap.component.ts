import { Component, Input } from '@angular/core';

@Component({
  selector: 'form-field-wrap',
  templateUrl: 'form-field-wrap.component.html'
})
export class FormFieldWrapComponent {

  @Input() label: string;
  @Input() floating: boolean;
  @Input() cssClass: string;
  @Input() inputId: string;
  @Input() errors: Array<any>;

  // Floating label by default
  isFloating() {
    return this.floating === false ? false : true;
  }
}
