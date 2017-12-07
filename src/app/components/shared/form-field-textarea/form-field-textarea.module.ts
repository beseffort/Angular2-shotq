import { NgModule } from '@angular/core';
import { FormFieldTextareaComponent } from './form-field-textarea.component';
import { FormsModule } from '@angular/forms';
import { FormFieldModule } from '../form-field';
import { CommonModule }                    from '@angular/common';

@NgModule({
  imports: [CommonModule, FormsModule, FormFieldModule],
  declarations: [
    FormFieldTextareaComponent
  ],
  exports: [
    FormFieldTextareaComponent
  ]
})
export class FormFieldTextareaModule {}
