import { NgModule }                 from '@angular/core';
/* Components*/
import { FormFieldComponent }       from './form-field.component';
import { FormFieldWrapComponent }   from '../form-field-wrap/form-field-wrap.component';
/* Directives */
import { GoogleAddressModule  }   from '../../../directives/google-address';
/* Modules */
import { DropdownModule }           from 'ngx-dropdown';
import { CommonModule }             from '@angular/common';
import { FormsModule }              from '@angular/forms';
import { TextMaskModule }           from 'angular2-text-mask';
/* Pipes */
import { DecimalPipe }              from '@angular/common';
import { PipesModule }              from '../../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    TextMaskModule,
    PipesModule,
    GoogleAddressModule
  ],
  declarations: [
    FormFieldComponent,
    FormFieldWrapComponent
  ],
  exports: [
    FormFieldComponent,
    FormFieldWrapComponent
  ],
  providers: [DecimalPipe]
})
export class FormFieldModule {}
