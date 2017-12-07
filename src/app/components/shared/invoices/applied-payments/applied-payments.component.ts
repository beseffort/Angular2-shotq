import { Component, Input } from '@angular/core';

import { Invoice } from '../../../../models/invoice';
import { AppliedPayment } from '../../../../models/applied-payment.model';
import { AppliedPaymentService } from '../../../../services/applied-payment/applied-payment.service';
import { SignalService } from '../../../../services/signal-service/signal.service';


@Component({
  selector: 'app-applied-payments',
  templateUrl: './applied-payments.component.html',
  styleUrls: [
    './applied-payments.component.scss'
  ]
})
export class AppliedPaymentsComponent {
  @Input() invoice: Invoice;
  private isLoading: boolean = false;
  private appliedPayments: AppliedPayment[] = [];

  constructor(private appliedPaymentsService: AppliedPaymentService,
              private signalService: SignalService) {
    this.signalService.stream
      .filter(message => message.group === 'payment' && message.type === 'applied')
      .subscribe(message => {
        this.getAppliedPayments();
      });
  }


  ngOnChanges(changes) {
    if (changes.invoice && changes.invoice.currentValue) {
      this.isLoading = true;
      this.getAppliedPayments();
    }
  }


  getAppliedPayments() {
    this.appliedPaymentsService.getList({invoice: this.invoice.id})
      .map(res => res.results)
      .subscribe(res => {
        this.isLoading = false;
        this.appliedPayments = res;
      });

  }

}
