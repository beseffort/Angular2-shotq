import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMyDatePickerModule } from 'ngx-mydatepicker';
import { DropdownSelectModule } from '../dropdown-select/dropdown-select.module';
import { GoogleAddressModule } from '../../../directives/google-address';

import { JobContactDialogComponent } from './job-contact-dialog.component';
import { JobRoleSelectComponent } from './job-role-select.component';
import { JobsUiService } from './jobs-ui.service';
import { PipesModule } from '../../../pipes/pipes.module';
import { InvoicesModule } from '../invoices/invoices.module';

@NgModule({
  imports: [
    CommonModule,
    DropdownSelectModule,
    FormsModule,
    NgxMyDatePickerModule,
    ReactiveFormsModule,
    GoogleAddressModule,
    PipesModule,
    InvoicesModule
  ],
  exports: [
    FormsModule,
    JobRoleSelectComponent
  ],
  declarations: [
    JobContactDialogComponent,
    JobRoleSelectComponent
  ],
  providers: [
    JobsUiService
  ]
})
export class JobUiModule {
}
