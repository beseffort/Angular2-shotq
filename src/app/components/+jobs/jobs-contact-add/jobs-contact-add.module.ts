import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { JobsContactAddComponent } from './jobs-contact-add.component';
import { FormsModule } from '@angular/forms';
import { FormFieldModule } from '../../shared/form-field';
import { CommonModule }                    from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FormFieldModule
  ],
  declarations: [JobsContactAddComponent],
  exports: [JobsContactAddComponent],
})
export class JobsContactAddModule {}
