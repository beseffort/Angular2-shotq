import { NgModule }               from '@angular/core';
import { TopNavbarComponent }     from './top-navbar.component';
import { NgxMyDatePickerModule } from 'ngx-mydatepicker';

/* Modules */
import { RouterModule }           from '@angular/router';
import { DropdownModule }         from 'ngx-dropdown';
import { FormsModule, ReactiveFormsModule }            from '@angular/forms';
import { SqDatetimepickerModule } from 'ngx-eonasdan-datetimepicker';
import { CommonModule }           from '@angular/common';
import { FormFieldModule }        from '../shared/form-field';
import { SharedModule }           from '../shared';
import { CustomDropdownModule }   from '../shared/dropdown';
import { ContactsUiModule } from '../shared/contacts-ui/contacts-ui.module';
import { ContactDialogComponent } from '../shared/contacts-ui/contact-dialog.component';
import { ContactsUiService } from '../shared/contacts-ui/contacts-ui.service';
import { JobService } from '../../services/job';
import { GoogleAddressModule  } from '../../directives/google-address';
import { ModalModule, TypeaheadModule } from 'ngx-bootstrap';
import { QuickContractComponent } from './quick-contract/quick-contract.component';
import { ClientNavbarComponent } from './client-navbar';
import { DropdownSelectModule } from '../shared/dropdown-select/dropdown-select.module';
import { QuickJobComponent } from './quick-job/quick-job.component';
import { ContactSetOrCreateComponent } from '../+contacts/contact-set-or-create/contact-set-or-create.component';
import { JobUiModule } from '../shared/jobs-ui/jobs-ui.module';

@NgModule({
  providers: [
    JobService,
    ContactsUiService
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FormFieldModule,
    DropdownModule,
    SharedModule,
    CustomDropdownModule,
    DropdownSelectModule,
    ModalModule.forRoot(),
    TypeaheadModule.forRoot(),
    NgxMyDatePickerModule,
    JobUiModule,
    SqDatetimepickerModule,
    GoogleAddressModule,
    ContactsUiModule,
  ],
  declarations: [
    TopNavbarComponent,
    QuickContractComponent,
    QuickJobComponent,
    ClientNavbarComponent,
    ContactSetOrCreateComponent
  ],
  exports: [
    TopNavbarComponent
  ],
  entryComponents: [
    QuickContractComponent,
    QuickJobComponent,
    ContactSetOrCreateComponent,
    ContactDialogComponent
  ]
})
export class TopNavbarModule {}
