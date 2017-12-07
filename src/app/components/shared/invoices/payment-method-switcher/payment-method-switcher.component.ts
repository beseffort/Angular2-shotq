import * as _ from 'lodash';
import {
  Component, OnInit, Input,
  Output, SimpleChanges, EventEmitter
} from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import {
  MerchantAccount,
  PAYMENT_PROVIDERS
} from '../../../../models/merchant-account';
import {
  createPaymentMethodForm,
  PaymentMethod
} from '../../../../models/payment-method';
import { MerchantAccountService } from '../../../../services/merchant-account/merchant-account.service';


@Component({
  selector: 'payment-method-switcher',
  templateUrl: './payment-method-switcher.component.html',
  styleUrls: ['./payment-method-switcher.component.scss']
})
export class PaymentMethodSwitcherComponent implements OnInit {
  form: FormGroup;
  paymentProviders = PAYMENT_PROVIDERS;
  merchantAccounts: MerchantAccount[] = [];

  @Input() paymentMethodInfo: PaymentMethod;
  @Output() onChange: EventEmitter<PaymentMethod> = new EventEmitter<PaymentMethod>();

  constructor(
    private fb: FormBuilder,
    private merchantAccountService: MerchantAccountService
  ) { }

  ngOnInit() {
    this.form = createPaymentMethodForm(this.fb, this.paymentMethodInfo);
    this.form.valueChanges.debounceTime(300).subscribe((paymentInfo) => {
      this.onChange.emit(paymentInfo);
    });
    this.merchantAccountService.getList({available: true}).subscribe((accounts: MerchantAccount[]) => {
      this.merchantAccounts = accounts;
      if (this.merchantAccounts.length === 0) {
        this.form.patchValue({
          collect_manually: true
        });
      }
    });
  }

}
