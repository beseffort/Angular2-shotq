import { NgModule } 						          from '@angular/core';
import { FormFieldDatepickerComponent } 	from './form-field-datepicker.component';
import { DatepickerModule } 				      from 'ngx-bootstrap';
import { FormsModule } 						        from '@angular/forms';
import { FormFieldModule } 					      from '../form-field';
import { CommonModule }                    from '@angular/common';

@NgModule({
  imports: [CommonModule, FormsModule, DatepickerModule, FormFieldModule],
  declarations: [
    FormFieldDatepickerComponent
  ],
  exports: [
    FormFieldDatepickerComponent
  ]
})
export class FormFieldDatepickerModule {}
