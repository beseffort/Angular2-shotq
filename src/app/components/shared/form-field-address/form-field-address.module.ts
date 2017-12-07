import { NgModule }                       from '@angular/core';
import { FormFieldAddressComponent }      from './form-field-address.component';
import { CommonModule }             from '@angular/common';
import { FormsModule }                    from '@angular/forms';
import { FormFieldModule }                from '../form-field';
import { TooltipModule }                  from 'ngx-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FormFieldModule,
    TooltipModule.forRoot()
  ],
  declarations: [
    FormFieldAddressComponent
  ],
  exports: [
    FormFieldAddressComponent
  ]
})
export class FormFieldAddressModule {}
