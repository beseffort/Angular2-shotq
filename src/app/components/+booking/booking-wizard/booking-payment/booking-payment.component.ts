import { Component, EventEmitter, Input, Output, ViewContainerRef } from '@angular/core';
import { Proposal } from '../../../../models/proposal';
import { BookingOverview } from '../../../../models/proposal-payment-overview.model';
import { Modal, Overlay } from 'single-angular-modal';
import { MerchantAccountService } from '../../../../services/merchant-account/merchant-account.service';
import { JobService } from '../../../../services/job/job.service';
import { ScheduledPaymentService } from '../../../../services/scheduled-payment/scheduled-payment.service';
import { Invoice } from '../../../../models/invoice';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';


@Component({
  selector: 'booking-payment',
  templateUrl: './booking-payment.component.html',
  styleUrls: ['./booking-payment.component.scss'],
})
export class BookingPaymentComponent {
  @Input() proposal: Proposal;
  @Input() overview: BookingOverview;
  @Output() onPay = new EventEmitter<any>();
  private invoice: Invoice;

  constructor(private modal: Modal,
              private overlay: Overlay,
              private vcRef: ViewContainerRef,
              private jobService: JobService,
              private flashMessageService: FlashMessageService,
              private scheduledPaymentService: ScheduledPaymentService,
              private merchantAccountService: MerchantAccountService) {
    overlay.defaultViewContainer = vcRef;

  }

  getInvoice() {
    return this.jobService.getInvoices(this.proposal.job.id)
      .filter(res => !!res.results.length)
      .map(res => res.results[0])
      .switchMap(invoice => {
        this.invoice = invoice;
        return this.scheduledPaymentService.getList({invoice: this.invoice.id});
      })
      .map(res => res.results[0]);
  }

  payWithCheck() {
    this.getInvoice()
      .switchMap(schedule => this.merchantAccountService.payWithCheck(this.invoice))
      .subscribe(res => {
        this.onPay.emit();
      });
  }

  payWithCard() {
    if (this.proposal.collect_manually) {
      this.flashMessageService.error('Payment method is set to collect manually');
      return;
    }


    this.getInvoice()
      .switchMap(schedule => this.merchantAccountService.openChargeForm(this.invoice, schedule))
      .subscribe(res => {
        this.onPay.emit();
      });


  }
}
