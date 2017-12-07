import * as _ from 'lodash';
import {
  Component, OnInit, Input,
  Output, SimpleChanges, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { IMyOptions, IMyDateModel } from 'ngx-mydatepicker';
import { ProposalSchedulePaymentTemplateService } from '../../../../../services/proposal-schedule-payment-template';
import { ProposalSchedulePaymentItemTemplate } from '../../../../../models/proposal-schedule-payment-item-template';

@Component({
  selector: 'schedule-payment-form',
  templateUrl: './schedule-payment-form.component.html',
  styleUrls: ['./schedule-payment-form.component.scss']
})
export class ProposalSchedulePaymentFormComponent implements OnInit {
  @Input() item: ProposalSchedulePaymentItemTemplate;
  @Input() proposalHasEvent: boolean;
  @Input() displayDelete: boolean = true;
  @Input() displayAtBooking: boolean = true;
  @Input() displayRemainingBalance: boolean = true;
  @Output() deleted: EventEmitter<any> = new EventEmitter<any>();
  @Output() canceled: EventEmitter<any> = new EventEmitter<any>();
  @Output() saved: EventEmitter<ProposalSchedulePaymentItemTemplate> = new EventEmitter<ProposalSchedulePaymentItemTemplate>();
  formHasErrors: boolean = false;
  form: FormGroup;
  percentTypes: string[] = [
    'percent_of_total',
    'percent_remaining'
  ];
  dueDateWithOffset: string[] = [
    'after_booking',
    'before_event',
    'after_event'];
  amountTypes: {value: string, label: string}[] = [
    {value: 'percent_of_total', label: 'Percentage of Total'},
    {value: 'percent_remaining', label: 'Percentage of Balance'},
    {value: 'fixed', label: 'Specific Amount'}
  ];
  dueDateChoices: {value: string, label: string}[] = [
    {value: 'after_booking', label: 'After Booking'},
    {value: 'exact_date', label: 'Choose a Date'},
  ];
  dueDateOffsetType: {value: string, label: string}[] = [
    {value: 'days', label: 'Days'},
    {value: 'weeks', label: 'Weeks'},
    {value: 'months', label: 'Months'}
  ];

  private dueDatePickerOptions: IMyOptions = {
      dateFormat: 'mm/dd/yyyy'
  };

  constructor(
    private fb: FormBuilder,
    private proposalSchedulePaymentTemplateService: ProposalSchedulePaymentTemplateService
  ) { }

  ngOnInit() {
    if (this.proposalHasEvent) {
      this.dueDateChoices = this.dueDateChoices.concat([
        {value: 'before_event', label: 'Before the Event'},
        {value: 'after_event', label: 'After the Event'},
        {value: 'day_of_event', label: 'Day of the Event'}
      ]);
    }
    if (this.displayAtBooking) {
      this.dueDateChoices = [{value: 'at_booking', label: 'At Booking Time'}].concat(this.dueDateChoices);
    }
    if (this.displayRemainingBalance) {
      this.amountTypes.unshift({value: 'all_remaining', label: 'Remaining Balance'});
    }
    this.form = this.fb.group({
      title: [this.item.title || ''],
      amount_type: [this.item.amount_type || 'fixed'],
      amount: [this.item.amount || '1.00', this.isValidPositiveNumber],
      due_date_type: [this.item.due_date_type || 'day_of_event'],
      due_date_offset: [this.item.due_date_offset || null, this.isValidPositiveNumber],
      due_date_offset_type: [this.item.due_date_offset_type || 'days'],
      due_date: [this.item.due_date]
    });
    this.form.valueChanges.debounceTime(300).subscribe((changes: SimpleChanges) => {
      _.assign(this.item, this.form.value);
      this.generatePaymentTitle();
    });
    this.form.controls['amount_type'].valueChanges.subscribe((amountType: string) => {
      if (amountType === 'all_remaining') {
        this.form.patchValue({'amount': '0.00'});
      }
    });
    this.form.controls['due_date_type'].valueChanges.subscribe((dueDateType: string) => {
      if (this.dueDateWithOffset.indexOf(dueDateType) === -1) {
        this.form.patchValue({due_date_offset: null});
      }
    });
    this.generatePaymentTitle();
  }

  cancel() {
    this.canceled.emit(null);
  }

  save() {
    if (!this.formHasErrors && this.form.status === 'VALID') {
      this.saved.emit(this.item);
    }
  }

  deletePayment() {
    this.deleted.emit(null);
  }

  private onSucsessGenerateTitle(res: {title: string}) {
    this.item.title = res.title;
    this.formHasErrors = false;
  }

  private onErrorGenerateTitle(res) {
    this.formHasErrors = true;
  }

  private isValidPositiveNumber(control: AbstractControl) {
    if (_.isNumber(control.value) && control.value <= 0) {
      return {positiveNumber: true};
    }
    return null;
  }

  private generatePaymentTitle() {
    this.proposalSchedulePaymentTemplateService.generatePaymentTitle(this.item).subscribe(
      this.onSucsessGenerateTitle.bind(this),
      this.onErrorGenerateTitle.bind(this)
    );
  }
}
