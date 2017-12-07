import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PackageAddComponent } from './package-add.component';
import { FormsModule } from '@angular/forms';
import { FormFieldModule } from '../../../shared/form-field';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FormFieldModule
  ],
  declarations: [PackageAddComponent],
  exports: [PackageAddComponent]
})
export class PackageAddModule {}
