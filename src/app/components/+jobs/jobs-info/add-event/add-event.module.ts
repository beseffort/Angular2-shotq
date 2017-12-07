import { NgModule }               from '@angular/core';
import { AddEventComponent }      from './add-event.component';
import { MdRadioModule }          from '@angular2-material/radio';
import { FormsModule }            from '@angular/forms';
import { AccordionModule }        from 'ngx-accordion';
import { MyDatePickerModule }     from 'mydatepicker';
import { DatePickerNewModule }    from '../../../shared/datepicker-new';
import { FormFieldAddressModule } from '../../../shared/form-field-address';
import { FormFieldModule }        from '../../../shared/form-field';
import { EditableLabelModule }    from '../../../shared/editable-label';
import { TimepickerModule }       from '../../../shared/timepicker';
import { PipesModule }            from '../../../../pipes/pipes.module';
import { CommonModule }           from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    MdRadioModule,
    AccordionModule,
    FormsModule,
    FormFieldAddressModule,
    MyDatePickerModule,
    FormFieldModule,
    EditableLabelModule,
    PipesModule,
    DatePickerNewModule,
    TimepickerModule
  ],
  declarations: [AddEventComponent],
  exports: [AddEventComponent]
})
export class AddEventModule {}
