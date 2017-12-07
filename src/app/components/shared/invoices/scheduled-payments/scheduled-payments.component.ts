import { Component, EventEmitter, Input, Output } from '@angular/core';

import moment from 'moment';
import * as _ from 'lodash';
import { Modal } from 'single-angular-modal/plugins/bootstrap';

import { Invoice } from '../../../../models/invoice';
import { ScheduledPayment } from '../../../../models/scheduled-payment.model';
import { ScheduledPaymentService } from '../../../../services/scheduled-payment/scheduled-payment.service';
import { MerchantAccountService } from '../../../../services/merchant-account/merchant-account.service';
import { SignalService } from '../../../../services/signal-service/signal.service';


@Component({
  selector: 'app-scheduled-payments',
  templateUrl: './scheduled-payments.component.html',
  styleUrls: [
    './scheduled-payments.component.scss'
  ]
})
export class ScheduledPaymentsComponent {
  @Input() invoice: Invoice;
  @Input() adminMode = false;

  scheduledPayments: ScheduledPayment[] = [];
  isLoading = false;

  actions = [
    {
      id: 'make-payment',
      name: 'Make Payment',
      icon: 'icon-edit',
      title: 'Make Payment',
      callback: this.actionMakePayment,
      active: (schedule) => schedule.status !== 'paid',
    },
    // {
    //   id: 'refund',
    //   name: 'Refund',
    //   icon: 'icon-edit',
    //   title: 'Refund',
    //   callback: this.actionRefund
    //
    // },
    // {
    //   id: 'void',
    //   name: 'Void',
    //   icon: 'icon-edit',
    //   title: 'Void',
    //   callback: this.actionVoid
    //
    // },
  ];


  constructor(private scheduledPaymentService: ScheduledPaymentService,
              private merchantAccountService: MerchantAccountService,
              private signalService: SignalService,
              public modal: Modal) {
  }

  ngOnChanges(changes) {
    if (changes.invoice) {
      this.isLoading = true;
      this.getScheduledPayments();
    }
  }

  getScheduledPayments() {
    this.scheduledPaymentService.getList({invoice: this.invoice.id})
      .map(res => res.results)
      .subscribe(res => {
        this.isLoading = false;
        this.scheduledPayments = res;
        this.scheduledPayments.forEach(item => {
          item.balance = parseFloat(<string>item.balance);
          item._actions = this.actions.filter(action => action.active(item));
          item._humanizedStatus = this.getScheduledPaymentStatus(item);
        });
      });
  }

  payWithCard(schedule: ScheduledPayment) {
    this.merchantAccountService.openChargeForm(this.invoice, schedule)
      .subscribe(res => {
        this.getScheduledPayments();
        this.signalService.send({
          group: 'payment',
          type: 'applied',
          instance: res
        });
      });
  }

  payWithCheck() {
    this.merchantAccountService.payWithCheck(this.invoice)
      .subscribe(res => {
        this.getScheduledPayments();
        this.signalService.send({
          group: 'payment',
          type: 'applied',
          instance: res
        });
      });
  }


  togglePay(schedule: ScheduledPayment) {
    if (this.invoice.merchant_account_details) {
      if (this.invoice.pay_with_check) {
        schedule._buttonOpen = true;
      } else {
        this.payWithCard(schedule);
      }
    }

  }

  actionMakePayment(schedule) {
    this.payWithCard(schedule);
  }

  actionRefund(schedule) {
  }

  actionVoid(schedule) {

  }

  onActionSelected(action, schedule) {
    action.callback.bind(this)(schedule);
  }

  private getScheduledPaymentStatus(scheduledPayment: ScheduledPayment): string {
    if (scheduledPayment.status === 'paid') {
      return 'Paid';
    }
    let dueDate = moment(scheduledPayment.due).endOf('date');
    let currentDate = moment();
    if (_.isEqual(dueDate.toArray().splice(0, 3), currentDate.toArray().splice(0, 3))) {
      return 'Due Today';
    }
    if (scheduledPayment.overdue) {
      return 'Overdue';
    }
    return 'Pending';
  }

}
