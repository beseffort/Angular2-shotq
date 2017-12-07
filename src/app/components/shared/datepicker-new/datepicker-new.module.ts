import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MyDatePickerModule } from 'mydatepicker';
import { DatePickerNewComponent } from './datepicker-new.component';
import { CommonModule }                    from '@angular/common';

@NgModule({
  imports: [CommonModule, FormsModule, MyDatePickerModule],
  declarations: [
    DatePickerNewComponent
  ],
  exports: [
    DatePickerNewComponent
  ]
})
export class DatePickerNewModule {}
