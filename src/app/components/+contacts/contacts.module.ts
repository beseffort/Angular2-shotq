import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MdCheckboxModule } from '@angular2-material/checkbox';
import { MyDatePickerModule } from 'mydatepicker';
import { FileUploadModule } from 'ng2-file-upload';
import { PaginationModule } from 'ngx-bootstrap';
import { DropdownModule } from 'ngx-dropdown';
import { NgxMyDatePickerModule } from 'ngx-mydatepicker';
import { PipesModule } from '../../pipes/pipes.module';
import { SharedModule } from '../shared';
import { ContactDialogComponent } from '../shared/contacts-ui/contact-dialog.component';
import { ContactsUiModule } from '../shared/contacts-ui/contacts-ui.module';
import { DragAndDropImageModule } from '../shared/drag-and-drop-image';
import { CustomDropdownModule } from '../shared/dropdown';
import { FormFieldModule } from '../shared/form-field';
import { FormFieldAddressModule } from '../shared/form-field-address';
import { FormNgSelectWrapModule } from '../shared/form-ng-select-wrap';
import { MessagingUiModule } from '../shared/messaging-ui/messaging-ui.module';
import { MessagingUiService } from '../shared/messaging-ui/messaging-ui.service';

import { ContactProfileComponent } from './contact-profile/contact-profile.component';
import { ContactsListComponent } from './contacts-list/contacts-list.component';
import { CONTACTS_ROUTES } from './contacts.routes';
import { ImportCSVComponent } from './import-csv/import-csv.component';
import { ImportCSVStepFourModalComponent } from './import-csv/step-four-modal/step-four-modal.component';
import { ContactDeleteModalComponent } from './contacts-list/contact-delete/contact-delete-modal.component';
import { InvoicesModule } from '../shared/invoices/invoices.module';

/* Directives */
@NgModule({
  imports: [
    RouterModule.forChild(CONTACTS_ROUTES),
    CommonModule,
    ContactsUiModule,
    CustomDropdownModule,
    DragAndDropImageModule,
    DropdownModule,
    FileUploadModule,
    FormFieldAddressModule,
    FormFieldModule,
    FormNgSelectWrapModule,
    FormsModule,
    MdCheckboxModule,
    MessagingUiModule,
    MyDatePickerModule,
    NgxMyDatePickerModule,
    PaginationModule.forRoot(),
    PipesModule,
    ReactiveFormsModule,
    SharedModule,
    InvoicesModule
  ],
  declarations: [
    ContactProfileComponent,
    ContactsListComponent,
    ImportCSVComponent,
    ImportCSVStepFourModalComponent,
    ContactDeleteModalComponent
  ],
  entryComponents: [
    ContactDialogComponent,
    ImportCSVStepFourModalComponent,
    ContactDeleteModalComponent
  ],
  exports: [
    ContactsListComponent,
    ContactProfileComponent,
    ImportCSVComponent,
    ImportCSVStepFourModalComponent,
    ContactDeleteModalComponent
  ],
  providers: [
    MessagingUiService
  ]
})
export class ContactsModule {
}
