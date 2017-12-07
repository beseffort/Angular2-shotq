import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import * as _ from 'lodash';
import { Modal } from 'single-angular-modal/plugins/bootstrap';

import { BaseTemplateListComponent } from '../../../templates/base-template-list.component';
import { ProposalSchedulePaymentItemTemplate } from '../../../../../models/proposal-schedule-payment-item-template';
import { FlashMessageService } from '../../../../../services/flash-message/flash-message.service';
import { SignalService } from '../../../../../services/signal-service/signal.service';
import { ProposalSchedulePaymentTemplateService } from '../../../../../services/proposal-schedule-payment-template/proposal-schedule-payment-template.service';
import { ScheduleTemplateAddComponent } from '../schedule-template-add/schedule-template-add.component';



@Component({
  selector: 'app-schedule-templates',
  templateUrl: '../../../templates/base-template-list.component.html',
  styleUrls: ['../../../templates/base-template-list.component.scss'],
})
export class ScheduleTemplatesComponent extends BaseTemplateListComponent<ProposalSchedulePaymentItemTemplate> {
  @ViewChild('modifyScheduleTemplate') public modalTemplate: ScheduleTemplateAddComponent;

  modelName = 'Payment Schedule';
  inlineMode = true;
  prependAddButton = true;
  sliderContainerId = 'scheduleTemplateSlider';

  constructor(templateService: ProposalSchedulePaymentTemplateService,
              router: Router,
              route: ActivatedRoute,
              flash: FlashMessageService,
              modal: Modal,
              private signal: SignalService) {
    super(router, route, flash, modal);
    this.templateService = templateService;

    this.signal.stream
      .filter(message => message.group === 'scheduleTemplate')
      .subscribe((message) => {
        if (message.type === 'edit') {
          let instance = _.find(this.templates, {id: message.instance.id});
          if (!!instance) {
            Object.assign(instance, message.instance);
          }
          return;
        }

        if (message.type === 'add') {
          this.destroySlickSlider();
          this.templates.unshift(message.instance);
          this.initSlickSlider();
        }
      });
  }

  extractTemplates(result): void {
    this.templates = result;
    this.initSlickSlider();
  }

  editTemplate(template) {
    this.modalTemplate.show(template);
  }

  openTemplate(template) {
    this.modalTemplate.show(template);
  }

  addTemplateClick() {
    this.modalTemplate.show();
  }

}
