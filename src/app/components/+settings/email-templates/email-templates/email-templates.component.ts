import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import * as _ from 'lodash';
import { Modal } from 'single-angular-modal/plugins/bootstrap';

import { BaseTemplateListComponent } from '../../templates/base-template-list.component';
import { EmailTemplate } from '../../../../models/email-template.model';
import { EmailTemplateService } from '../../../../services/email-template/email-template.service';
import { BreadcrumbService } from '../../../shared/breadcrumb/components/breadcrumb.service';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import { EmailTemplateAddComponent } from '../email-template-add/email-template-add.component';
import { SignalService } from 'app/services/signal-service/signal.service';


@Component({
  selector: 'app-email-templates',
  templateUrl: '../../templates/base-template-list.component.html',
  styleUrls: ['../../templates/base-template-list.component.scss'],
})
export class EmailTemplatesComponent extends BaseTemplateListComponent<EmailTemplate> {
  @ViewChild('modifyEmailTemplate') public modifyEmailTemplate: EmailTemplateAddComponent;

  modelName = 'Email';
  inlineMode = true;
  prependAddButton = true;
  sliderContainerId = 'emailTemplateSlider';

  constructor(emailTemplateService: EmailTemplateService,
              router: Router,
              route: ActivatedRoute,
              flash: FlashMessageService,
              modal: Modal,
              breadcrumbService: BreadcrumbService,
              private signal: SignalService) {
    super(router, route, flash, modal);
    this.templateService = emailTemplateService;
    breadcrumbService.addFriendlyNameForRoute('/settings/templates/email', 'Emails');
    breadcrumbService.muteRoute('/settings/templates');

    this.signal.stream
      .filter(message => message.group === 'emailTemplate')
      .subscribe((message) => {
        if (message.type === 'edit') {
          let instance = _.find(this.templates, {id: message.instance.id});
          if (!!instance) {
            Object.assign(instance, message.instance);
          }
          return;
        }

        if (message.type === 'add') {
          this.templates.push(message.instance);
          this.getTemplates();
        }
      });
  }

  editTemplate(template) {
    this.modifyEmailTemplate.show(template, 'edit');
  }

  openTemplate(template) {
    this.modifyEmailTemplate.show(template, 'view');
  }

  addTemplateClick() {
    this.modifyEmailTemplate.show();
  }

}
