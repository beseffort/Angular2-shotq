import moment from 'moment';
import { Component, OnInit, OnChanges, SimpleChanges, Input, EventEmitter, Output } from '@angular/core';
import { Proposal } from '../../../../models/proposal';
import { ProposalSchedulePaymentValidaton } from '../../../../models/proposal-schedule-payment-validation';
import { ProposalService } from '../../../../services/proposal';
import { ProposalSchedulePaymentService } from '../../../../services/proposal-schedule-payment';
import { ActivatedRoute } from '@angular/router';
import { ScheduledPayment } from '../../../../models/scheduled-payment.model';
import { ProposalSchedulePayment } from '../../../../models/proposal-schedule-payment';

interface ValidationInfo {
  is_valid: boolean;
  result: Array<{
    remaining: number;
    payment_amount: number;
    payment_date: string;
    payment_tax: number;
    shipping_price: number;
    full_payment: number;
    due_date_type: string;
  }>;
}

@Component({
  selector: 'schedule-payment-table',
  templateUrl: './schedule-payment-table.component.html',
  styleUrls: ['./schedule-payment-table.component.scss']
})
export class SchedulePaymentTableComponent implements OnInit, OnChanges {
  @Input() proposal: Proposal;
  @Input() subtotalPrice: number;
  @Input() totalPrice: number;
  @Input() shippingPrice: number;

  @Output() hasBookingPayment = new EventEmitter<boolean>();

  selectedSchedule: ProposalSchedulePaymentValidaton;
  paymentTableData: ValidationInfo;

  constructor(private proposalService: ProposalService,
              private route: ActivatedRoute,
              private proposalSchedulePaymentService: ProposalSchedulePaymentService) {
  }

  ngOnInit() {
    this.validateSchedule();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['totalPrice']) {
      this.validateSchedule();
    }
  }

  private validateSchedule() {
    if (this.totalPrice === 0) {
      return;
    }
    this.route.data
      .filter(data => data.schedule.length)
      .switchMap((data: { schedule: ProposalSchedulePayment[] }) => {
        this.selectedSchedule = data.schedule[0];
        this.selectedSchedule.price = this.totalPrice;
        this.selectedSchedule.subtotal = this.subtotalPrice;
        this.selectedSchedule.shipping_price = this.shippingPrice;
        this.selectedSchedule.autocorrect = true;
        return this.proposalService.validatePaymentSchedule(this.proposal.id, this.selectedSchedule);
      })
      .subscribe((res: ValidationInfo) => {
        res.result.forEach((p) => {
          let dt = moment(p.payment_date);
          if (dt.isValid()) {
            p.payment_date = dt.format('MMMM D, YYYY');
          }
        });
        this.hasBookingPayment.emit(res.result.some(p => p.due_date_type === 'at_booking'));
        this.paymentTableData = res;
      });
  }

}
