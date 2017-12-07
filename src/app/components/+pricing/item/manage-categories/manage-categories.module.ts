import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ManageCategoriesComponent } from './manage-categories.component';
import { FormsModule } from '@angular/forms';
import { EditableLabelModule } from '../../../shared/editable-label/';
import { CommonModule }                    from '@angular/common';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    EditableLabelModule
  ],
  declarations: [ManageCategoriesComponent],
  exports: [ManageCategoriesComponent]
})
export class ManageCategoriesModule {}
