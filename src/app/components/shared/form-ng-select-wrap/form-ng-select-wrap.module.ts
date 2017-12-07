import { NgModule } from '@angular/core';
import { FormNgSelectWrapComponent } from './form-ng-select-wrap.component';
import { CommonModule }             from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormFieldModule } from '../form-field';

@NgModule({
  imports: [CommonModule, FormsModule, FormFieldModule],
  declarations: [
    FormNgSelectWrapComponent
  ],
  exports: [
    FormNgSelectWrapComponent
  ]
})
export class FormNgSelectWrapModule {}
