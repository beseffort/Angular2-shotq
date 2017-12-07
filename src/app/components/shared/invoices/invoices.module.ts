import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxMyDatePickerModule } from 'ngx-mydatepicker';
import { DropdownModule } from 'ngx-dropdown';
import { BsDropdownModule, ButtonsModule } from 'ngx-bootstrap';

import { DropdownSelectModule } from '../dropdown-select/dropdown-select.module';
import { InvoicesComponent } from './invoices.component';
import { InvoiceViewComponent } from './invoice-view/invoice-view.component';
import { PaymentMethodSwitcherComponent } from './payment-method-switcher/payment-method-switcher.component';
import { AppliedPaymentsComponent } from './applied-payments/applied-payments.component';
import { MerchantPayModalComponent } from './merchant-pay-modal/merchant-pay-modal.component';
import { PipesModule } from '../../../pipes/pipes.module';
import { CustomDropdownModule } from '../dropdown/dropdown.module';
import { ScheduledPaymentsComponent } from './scheduled-payments/scheduled-payments.component';


const INVOICE_COMPONENTS = [
  PaymentMethodSwitcherComponent,
  InvoicesComponent,
  InvoiceViewComponent,
  AppliedPaymentsComponent,
  MerchantPayModalComponent,
  ScheduledPaymentsComponent
];


@NgModule({
  imports: [
    CommonModule,
    BsDropdownModule.forRoot(),
    ButtonsModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    NgxMyDatePickerModule,
    PipesModule,
    ReactiveFormsModule,
    CustomDropdownModule,
    NgxMyDatePickerModule,
    DropdownSelectModule,
  ],
  exports: [
    ...INVOICE_COMPONENTS
  ],
  declarations: [
    ...INVOICE_COMPONENTS
  ],
  entryComponents: [
    MerchantPayModalComponent
  ]
})
export class InvoicesModule {
}
