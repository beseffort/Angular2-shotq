import * as _ from 'lodash';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ProposalSchedulePaymentItem } from '../../../../../models/proposal-schedule-payment-item';

@Component({
  selector: 'schedule-selected-payment-form',
  templateUrl: './schedule-selected-payment-form.component.html',
  styleUrls: ['./schedule-selected-payment-form.component.scss']
})
export class ScheduleSelectedPaymentFormComponent implements OnInit {
  @Input() payment: ProposalSchedulePaymentItem;
  @Output() paymentUpdated: EventEmitter<ProposalSchedulePaymentItem> = new EventEmitter<ProposalSchedulePaymentItem>();
  form: FormGroup;
  paymentMethods = [
    {value: 'card', label: 'Bank Card'},
    {value: 'paypal', label: 'Paypal'},
    {value: 'stripe', label: 'Stripe'}
  ];

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.form = this.fb.group({
      paid_date: [this.payment.paid_date || null],
      payment_method: [this.payment.payment_method || ''],
      transaction_id: [this.payment.transaction_id || ''],
      payment_description: [this.payment.payment_description || '']
    });
    this.form.valueChanges
      .debounceTime(300)
      .subscribe((changes) => {
        _.assign(this.payment, changes);
        this.paymentUpdated.emit(this.payment);
      });
  }

  onKeyUp(event, form: FormGroup) {
    if (!event.target.value) {
      form.patchValue({paid_date: null});
    }
  }

}
