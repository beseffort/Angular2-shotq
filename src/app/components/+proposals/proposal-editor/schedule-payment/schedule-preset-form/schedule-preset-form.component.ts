import * as _ from 'lodash';
import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ProposalSchedulePayment } from '../../../../../models/proposal-schedule-payment';
import { ProposalSchedulePaymentTemplate } from '../../../../../models/proposal-schedule-payment-template';
import { ProposalSchedulePaymentItemTemplate } from '../../../../../models/proposal-schedule-payment-item-template';

@Component({
  selector: 'schedule-preset-form',
  templateUrl: 'schedule-preset-form.component.html',
  styleUrls: ['./schedule-preset-form.component.scss']
})
export class SchedulePresetFormComponent implements OnInit {
  form: FormGroup;
  payment: ProposalSchedulePaymentItemTemplate;
  editIndex: number = null;
  schedule: ProposalSchedulePayment;
  atBookingPaymentIndex: number;
  remainingBalanceIndex: number;
  @Input('schedule') data: ProposalSchedulePayment;
  @Input() proposalHasEvent: boolean;
  @Input() canDelete: boolean = true;
  @Input() canSavePreset: boolean = true;
  @Output() saved: EventEmitter<ProposalSchedulePayment|ProposalSchedulePaymentTemplate> = new EventEmitter<ProposalSchedulePayment|ProposalSchedulePaymentTemplate>();
  @Output() deleted: EventEmitter<ProposalSchedulePayment|ProposalSchedulePaymentTemplate> = new EventEmitter<ProposalSchedulePayment|ProposalSchedulePaymentTemplate>();
  @Output() savedAsPreset: EventEmitter<ProposalSchedulePayment|ProposalSchedulePaymentTemplate> = new EventEmitter<ProposalSchedulePayment|ProposalSchedulePaymentTemplate>();
  @Output() canceled: EventEmitter<any> = new EventEmitter<any>();

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.schedule = _.cloneDeep(this.data);
    this.form = this.fb.group({
      title: [this.data.title || '', Validators.required],
      account: [this.data.account || 0]
    });
    this.form.valueChanges.subscribe((changes) => {
      _.assign(this.schedule, changes);
    });
    this.updateAtBookingPaymentIndex();
    this.updateRemainingBalanceIndex();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.form) {
      let data = changes['data'].currentValue;
      this.schedule = _.cloneDeep(data);
      this.form.reset(data);
      this.updateAtBookingPaymentIndex();
      this.updateRemainingBalanceIndex();
    }
  }

  addPayment() {
    let atBookingExist = this.schedule.payments.find(p => p.due_date_type === 'at_booking');
    let remainingBalanceExist = this.schedule.payments.find(p => p.amount_type === 'all_remaining');
    this.payment = {
      title: '',
      amount_type: remainingBalanceExist ? 'percent_of_total' : 'all_remaining',
      amount: '1.00',
      due_date_type: atBookingExist ? 'after_booking' : 'at_booking',
      due_date_offset: 1,
      due_date: null
    };
  }

  editPayment(index: number) {
    this.payment = _.cloneDeep(this.schedule.payments[index]);
    this.editIndex = index;
  }

  onCancel() {
    this.editIndex = null;
    this.payment = null;
  }

  onSaveNew(p: ProposalSchedulePaymentItemTemplate) {
    this.schedule.payments.push(p);
    this.onCancel();
    this.updateAtBookingPaymentIndex();
    this.updateRemainingBalanceIndex();
  }

  onSaveEdited(p: ProposalSchedulePaymentItemTemplate) {
    this.schedule.payments[this.editIndex] = p;
    this.onCancel();
    this.updateAtBookingPaymentIndex();
    this.updateRemainingBalanceIndex();
  }

  save() {
    this.saved.emit(this.schedule);
  }

  delete() {
    this.deleted.emit(this.schedule);
  }

  saveAsPreset() {
    this.deleteScheduleId();
    this.savedAsPreset.emit(this.schedule);
  }

  cancel() {
    this.canceled.emit(null);
  }

  deletePayment() {
    this.schedule.payments.splice(this.editIndex, 1);
    this.onCancel();
    this.updateAtBookingPaymentIndex();
    this.updateRemainingBalanceIndex();
  }

  private deleteScheduleId() {
    this.schedule.id = undefined;
    _.forEach(this.schedule.payments, (p) => {
      p.id = p.schedule = undefined;
    });
  }

  private updateAtBookingPaymentIndex() {
    this.atBookingPaymentIndex = this.schedule.payments.findIndex(p => p.due_date_type === 'at_booking');
  }

  private updateRemainingBalanceIndex() {
    this.remainingBalanceIndex = this.schedule.payments.findIndex(p => p.amount_type === 'all_remaining');
  }

}
