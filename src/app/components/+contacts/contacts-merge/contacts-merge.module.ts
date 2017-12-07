import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ContactsMergeComponent }           from './contacts-merge.component';
import { CommonModule }                     from '@angular/common';
import { FormsModule }                      from '@angular/forms';
import { FormFieldModule }                  from '../../shared/form-field';
import { FormFieldAddressModule }           from '../../shared/form-field-address';
import { FormNgSelectWrapModule }           from '../../shared/form-ng-select-wrap';
import { ModalModule }                      from 'ngx-bootstrap';
import { PipesModule }                      from '../../../pipes/pipes.module';
import { EditableLabelModule }              from '../../shared/editable-label';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FormFieldModule,
    FormFieldAddressModule,
    FormNgSelectWrapModule,
    PipesModule,
    ModalModule,
    EditableLabelModule
  ],
  declarations: [ContactsMergeComponent],
  exports: [ContactsMergeComponent]
})
export class ContactsMergeModule {}
