import { NgModule } from '@angular/core';
import { ItemEditComponent } from './item-edit.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared';
import { FormFieldModule } from '../../../shared/form-field';
import { EditableLabelModule } from '../../../shared/editable-label/';
import { FormFieldTextareaModule } from '../../../shared/form-field-textarea';
import { DragAndDropImageModule } from '../../../shared/drag-and-drop-image';
import { CustomDropdownModule } from '../../../shared/dropdown';
import { MdSlideToggleModule } from '@angular2-material/slide-toggle';
// Pipes
import { PipesModule } from '../../../../pipes/pipes.module';
import { ModalModule } from 'ngx-bootstrap';
import { ManageCategoriesModule }   from '../manage-categories/';
import { CommonModule }                    from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FormFieldModule,
    PipesModule,
    EditableLabelModule,
    FormFieldTextareaModule,
    MdSlideToggleModule,
    DragAndDropImageModule,
    CustomDropdownModule,
    ModalModule,
    ManageCategoriesModule
  ],
  declarations: [
    ItemEditComponent,
  ],
  exports: [
    ItemEditComponent,
  ]
})
export class ItemEditModule {}
