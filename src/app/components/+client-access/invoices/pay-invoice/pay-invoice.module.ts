import { NgModule }                        from '@angular/core';
import { PayInvoiceComponent }             from './pay-invoice.component';
import { FormsModule }                     from '@angular/forms';
import { FormFieldModule }                 from '../../../shared/form-field';
import { FormFieldAddressModule }          from '../../../shared/form-field-address';
import { FormNgSelectWrapModule }          from '../../../shared/form-ng-select-wrap';
import { CommonModule }                    from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FormFieldModule,
    FormFieldAddressModule,
    FormNgSelectWrapModule
  ],
  declarations: [PayInvoiceComponent],
  exports: [PayInvoiceComponent]
})
export class PayInvoiceModule {}
