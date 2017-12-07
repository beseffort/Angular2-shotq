import * as _ from 'lodash';
import { Component, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MerchantAccount, PAYMENT_PROVIDERS } from '../../../../models/merchant-account';
import { Proposal } from '../../../../models/proposal';
import { PaymentMethod, createPaymentMethodForm } from '../../../../models/payment-method';
import { MerchantAccountService } from '../../../../services/merchant-account';
import { Observable } from 'rxjs/Observable';
import { MerchantGateway } from '../../../../models/merchant-gateway';


@Component({
  selector: 'proposal-receive-payment',
  templateUrl: './receive-payment.component.html'
})
export class ProposalReceivePaymentComponent implements OnChanges {
  @Input() proposal: Proposal;
  @Output() paymentUpdated: EventEmitter<PaymentMethod> = new EventEmitter<PaymentMethod>();
  @Output() stepChange: EventEmitter<{ tab?: number, option: number }> = new EventEmitter<{ tab?: number, option: number }>();
  form: FormGroup;
  paymentProviders = PAYMENT_PROVIDERS;
  merchantAccounts: MerchantAccount[] = [];
  paymentData: PaymentMethod;

  constructor(private fb: FormBuilder,
              private merchantAccountService: MerchantAccountService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['proposal']) {
      this.updateForm();
    }
  }

  updateForm() {
    this.paymentData = {
      merchant_account: this.proposal.merchant_account,
      collect_manually: this.proposal.collect_manually,
      pay_with_check: this.proposal.pay_with_check
    };
    this.form = createPaymentMethodForm(this.fb, this.paymentData);
    this.form.valueChanges.subscribe((values) => {
      this.paymentData = _.assign(this.paymentData, values);
      this.paymentUpdated.emit(this.paymentData);
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

  back(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.stepChange.emit({tab: -1, option: 1});
  }

  save(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.stepChange.emit({option: 5});
  }
}
