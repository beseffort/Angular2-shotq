import { NgModule }                  from '@angular/core';
/* Components */
import { ItemListComponent }         from './item/item-list/item-list.component';
import { ItemEditComponent } from './item/item-edit/item-edit.component';
import { PackageEditComponent }      from './package/package-edit/package-edit.component';
/* Modules */
import { CommonModule }                    from '@angular/common';
import { RouterModule }              from '@angular/router';
import { DropdownModule }            from 'ngx-dropdown';
import { FormsModule }               from '@angular/forms';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { SharedModule }              from '../shared';
import { FormFieldModule }           from '../shared/form-field';
import { FormFieldAddressModule }    from '../shared/form-field-address';
import { FormFieldDatepickerModule } from '../shared/form-field-datepicker';
import { FormFieldTextareaModule }   from '../shared/form-field-textarea';
import { FormNgSelectWrapModule }    from '../shared/form-ng-select-wrap';
import { MaterialTabModule }         from '../shared/material/tab';
import { DragAndDropImageModule } from '../shared/drag-and-drop-image';
import { AccordionModule }           from 'ngx-accordion';
import { FABToolbarModule }          from '../shared/material/fab-toolbar';
import { DragulaModule }             from 'ng2-dragula/ng2-dragula';
import { MdSlideToggleModule }       from '@angular2-material/slide-toggle';
import { EditableLabelModule }       from '../shared/editable-label/';
import { PipesModule }               from '../../pipes/pipes.module';
import { CustomDropdownModule }      from '../shared/dropdown';
import { ManageCategoriesModule } from './item/manage-categories/';

import {
 PaginationModule,
 ModalModule,
 TooltipModule
}                                    from 'ngx-bootstrap';

import { PRICING_ROUTES }            from './pricing.routes';
import { SpinnerModule } from '../shared/spinner/spinner.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(PRICING_ROUTES),
    FormsModule,
    DropdownModule,
    MultiselectDropdownModule,
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    FormFieldModule,
    SharedModule,
    FormFieldAddressModule,
    FormFieldDatepickerModule,
    FormNgSelectWrapModule,
    MaterialTabModule,
    DragAndDropImageModule,
    ManageCategoriesModule,
    AccordionModule,
    MdSlideToggleModule,
    FormFieldTextareaModule,
    FABToolbarModule,
    DragulaModule,
    EditableLabelModule,
    PipesModule,
    ModalModule,
    CustomDropdownModule,
    SpinnerModule
  ],
  declarations: [
    ItemListComponent,
    ItemEditComponent,
    PackageEditComponent
  ],
  exports: [
    ItemListComponent,
    ItemEditComponent,
    PackageEditComponent
  ],
})
export class PricingModule {}
