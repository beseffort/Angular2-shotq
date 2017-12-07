import { Component, ViewChild } from '@angular/core';

import { Observable } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap';

import { ProposalSchedulePaymentItemTemplate } from '../../../../../models/proposal-schedule-payment-item-template';
import { FlashMessageService } from '../../../../../services/flash-message/flash-message.service';
import { SignalService } from '../../../../../services/signal-service/signal.service';
import { CURRENT_PROFILE_ID } from '../../../../../services/access/access.service';
import { ProposalSchedulePayment } from '../../../../../models/proposal-schedule-payment';
import { ProposalSchedulePaymentTemplateService } from '../../../../../services/proposal-schedule-payment-template/proposal-schedule-payment-template.service';


@Component({
  selector: 'app-schedule-template-add',
  templateUrl: './schedule-template-add.component.html',
  styleUrls: ['./schedule-template-add.component.scss'],

})
export class ScheduleTemplateAddComponent {
  @ViewChild('modal') modal: ModalDirective;

  template: ProposalSchedulePayment | any = {payments: []};
  isLoading: boolean = true;
  readOnly: boolean = false;

  constructor(private templateService: ProposalSchedulePaymentTemplateService,
              private flash: FlashMessageService,
              private signal: SignalService) {
  }

  ngOnInit() {
  }

  getTemplate(id?: number) {
    this.isLoading = true;

    if (id)
      return this.templateService.get(id);

    return Observable.create(observer => {
      observer.next({
        title: '',
        payments: [],
        account: CURRENT_PROFILE_ID,
      });
      this.isLoading = false;
      observer.complete();
    });
  }

  save(schedule) {
    this.isLoading = true;

    let data = Object.assign({}, schedule);
    let method = !!schedule.id ? this.templateService.save : this.templateService.create;
    method.bind(this.templateService)(data)
      .subscribe((template) => {
        this.isLoading = false;
        this.hide();

        this.signal.send({
          group: 'scheduleTemplate',
          type: !!schedule.id ? 'edit' : 'add',
          instance: template
        });
        this.flash.success('Schedule template saved successfully.');
      }, errors => {
        this.isLoading = false;
        this.flash.error('Error saving schedule template.');
      });
  }

  show(template?: any) {
    let id = template ? template.id : null;
    this.readOnly = !!template;
    this.isLoading = true;

    this.modal.show();
    jQuery('.modal-backdrop')[0].classList.add('modal-backdrop_grey');
    this.getTemplate(id)
      .subscribe((instance: ProposalSchedulePaymentItemTemplate) => {
          this.isLoading = false;
          this.template = instance;
        },
        error => {
          let res = error.json();
          this.flash.error(res.detail || res.message);
          this.isLoading = false;
          this.hide();
        }
      );
  }

  hide() {
    this.modal.hide();
  }
}
