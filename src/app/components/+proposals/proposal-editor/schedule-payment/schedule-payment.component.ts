import * as _ from 'lodash';
import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { Proposal } from '../../../../models/proposal';
import { ProposalSchedulePayment } from '../../../../models/proposal-schedule-payment';
import { ProposalSchedulePaymentItem } from '../../../../models/proposal-schedule-payment-item';
import { ProposalSchedulePaymentTemplate } from '../../../../models/proposal-schedule-payment-template';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import { ProposalSchedulePaymentService } from '../../../../services/proposal-schedule-payment';
import { ProposalSchedulePaymentTemplateService } from '../../../../services/proposal-schedule-payment-template';
import { isBoolean } from 'util';

@Component({
  selector: 'schedule-payment',
  templateUrl: './schedule-payment.component.html',
  styleUrls: ['./schedule-payment.component.scss']
})
export class SchedulePaymentComponent implements OnInit, OnChanges {
  @Input() proposal: Proposal;
  @Output() stepChange: EventEmitter<{ tab: number, option: number }> = new EventEmitter<{ tab: number, option: number }>();
  @Output() isValid = new EventEmitter<boolean>();
  scheduleTemplates: ProposalSchedulePaymentTemplate[] = [];
  schedule: ProposalSchedulePayment | ProposalSchedulePaymentTemplate;
  selectedSchedule: ProposalSchedulePayment;
  activeScheduleTemplateId: number = null;
  editIndex: number = null;
  proposalHasEvent: boolean = false;
  valid: boolean = false;

  constructor(private flash: FlashMessageService,
              private proposalSchedulePaymentTemplateService: ProposalSchedulePaymentTemplateService,
              private proposalSchedulePaymentService: ProposalSchedulePaymentService) {
  }

  ngOnInit() {
    this.proposalSchedulePaymentTemplateService
      .getList({'status!': 'archived'})
      .subscribe((templates) => {
        this.scheduleTemplates = templates;
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['proposal']) {
      this.proposalHasEvent = !!this.proposal.job.main_event;
      this.loadProposalSchedule();
    }
  }

  loadProposalSchedule() {
    this.proposalSchedulePaymentService.getList({proposal: this.proposal.id}).subscribe((schedules) => {
      if (schedules.length > 0) {
        this.selectedSchedule = schedules[0];
      }
      this.validate();
    });
  }

  createNewSchedule(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.schedule = {title: '', account: 1, payments: [], proposal: this.proposal.id};
  }

  toggleScheduleTemplate(e: MouseEvent, scheduleTemplate: ProposalSchedulePaymentTemplate) {
    e.preventDefault();
    e.stopPropagation();
    if (this.activeScheduleTemplateId === scheduleTemplate.id) {
      this.activeScheduleTemplateId = null;
    } else {
      this.activeScheduleTemplateId = scheduleTemplate.id;
    }
  }

  editPreset(preset: ProposalSchedulePaymentTemplate) {
    this.editIndex = _.findIndex(this.scheduleTemplates, i => i.id === preset.id);
    this.schedule = preset;
  }

  editSelectedSchedule() {
    this.schedule = _.cloneDeep(this.selectedSchedule);
  }

  onSave(schedule: ProposalSchedulePayment | ProposalSchedulePaymentTemplate) {
    if (_.isNumber(this.editIndex)) {
      if (schedule.id) {
        this.proposalSchedulePaymentTemplateService
          .update(schedule.id, schedule)
          .subscribe((res) => {
            this.scheduleTemplates[this.editIndex] = schedule;
            this.resetForm();
            this.flash.success('Schedule template updated');
          });
      } else {
        this.proposalSchedulePaymentTemplateService.create(schedule).subscribe((res) => {
          this.scheduleTemplates.push(schedule);
          this.resetForm();
          this.flash.success('Schedule template created');
        });
      }
    } else {
      if (this.selectedSchedule && !schedule.id) {
        this.delSelectedSchedule().subscribe(() => {
          this.createOrUpdateSelected(<ProposalSchedulePayment>schedule);
        });
      } else {
        this.createOrUpdateSelected(<ProposalSchedulePayment>schedule);
      }
    }
  }

  onDelete(schedule: ProposalSchedulePayment | ProposalSchedulePaymentTemplate) {
    if (_.isNumber(this.editIndex)) {
      if (schedule.id) {
        this.proposalSchedulePaymentTemplateService.delete(schedule.id).subscribe((res) => {
          let index = this.scheduleTemplates.findIndex(item => (<any>item).id === schedule.id);
          if (index > -1) {
            this.scheduleTemplates.splice(index, 1);
          }
          this.resetForm();
          this.flash.success('Schedule template deleted');
        });
      }
    }
  }

  savePreset(schedule: ProposalSchedulePaymentTemplate) {
    this.proposalSchedulePaymentTemplateService.create(schedule).subscribe((res) => {
      this.scheduleTemplates.push(res);
      this.resetForm();
      this.flash.success('Schedule template added');
    });
  }

  usePreset(e: MouseEvent, schedulePreset: ProposalSchedulePaymentTemplate) {
    e.preventDefault();
    e.stopPropagation();
    let schedule = <ProposalSchedulePayment>_.cloneDeep(schedulePreset);
    schedule.id = undefined;
    _.forEach(schedule.payments, (p) => {
      p.schedule = p.id = undefined;
    });
    schedule.proposal = this.proposal.id;
    if (this.selectedSchedule) {
      this.delSelectedSchedule().subscribe(() => {
        this.proposalSchedulePaymentService.create(schedule).subscribe((res) => {
          this.selectedSchedule = res;
          this.flash.success('Schedule selected');
          this.validate();
        });
      });
    } else {
      this.proposalSchedulePaymentService.create(schedule).subscribe((res) => {
        this.selectedSchedule = res;
        this.flash.success('Schedule selected');
        this.validate();
      });
    }
  }

  back(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.stepChange.emit({
      tab: 2,
      option: 1
    });
  }

  next(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (this.valid) {
      this.stepChange.emit({
        tab: 2,
        option: 2
      });
    }
  }

  cancelEdit() {
    this.resetForm();
  }

  deleteSelectedSchedule() {
    this.flash.success('Schedule deleted');
    this.delSelectedSchedule().subscribe();
  }

  updateSelectedSchedule(payment: ProposalSchedulePaymentItem) {
    let index = this.selectedSchedule.payments.findIndex((p) => {
      return p.id === payment.id;
    });
    _.assign(this.selectedSchedule.payments[index], payment);
    let refresh = false;
    this.createOrUpdateSelected(this.selectedSchedule, refresh);
  }

  private resetForm() {
    this.schedule = this.editIndex = null;
  }

  private delSelectedSchedule() {
    return this.proposalSchedulePaymentService.delete(this.selectedSchedule.id).do(() => {
      this.selectedSchedule = null;
      this.validate();
    });
  }

  private validate() {
    let valid = !!this.selectedSchedule;
    if (this.valid !== valid) {
      this.valid = valid;
      this.isValid.emit(this.valid);
    }
  }

  private createOrUpdateSelected(schedule: ProposalSchedulePayment, refresh: boolean = true) {
    if (schedule.id) {
      this.proposalSchedulePaymentService.update(schedule).subscribe((res) => {
        if (refresh) {
          this.selectedSchedule = res;
          this.flash.success('Schedule updated');
        }
        this.resetForm();
      });
    } else {
      this.proposalSchedulePaymentService.create(schedule).subscribe((res) => {
        if (refresh) {
          this.flash.success('Schedule created');
          this.selectedSchedule = res;
          this.validate();
        }
        this.resetForm();
      });
    }
  }
}
