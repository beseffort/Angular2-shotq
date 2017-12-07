import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMyDatePickerModule } from 'ngx-mydatepicker';
import { DropdownSelectModule } from '../dropdown-select/dropdown-select.module';
import { GoogleAddressModule  } from '../../../directives/google-address';

import { ContactsUiService } from './contacts-ui.service';
import { ContactDialogComponent } from './contact-dialog.component';

@NgModule({
  imports: [
    CommonModule, DropdownSelectModule, FormsModule, NgxMyDatePickerModule,
    ReactiveFormsModule, GoogleAddressModule
  ],
  exports: [FormsModule],
  declarations: [ContactDialogComponent],
  providers: [ContactsUiService],
})
export class ContactsUiModule {
}
