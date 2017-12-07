import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import * as _ from 'lodash';
import { Modal } from 'single-angular-modal/plugins/bootstrap';

import { BaseTemplateListComponent } from '../../../templates/base-template-list.component';
import { TaxTemplate } from '../../../../../models/tax-template.model';
import { FlashMessageService } from '../../../../../services/flash-message/flash-message.service';
import { SignalService } from '../../../../../services/signal-service/signal.service';
import { TaxTemplateRESTService } from 'app/services';
import { TaxesTemplateAddComponent } from '../taxes-template-add/taxes-template-add.component';


@Component({
  selector: 'app-taxes-templates',
  templateUrl: '../../../templates/base-template-list.component.html',
  styleUrls: ['../../../templates/base-template-list.component.scss'],
})
export class TaxesTemplatesComponent extends BaseTemplateListComponent<TaxTemplate> {
  @ViewChild('modifyTaxesTemplate') public modalTemplate: TaxesTemplateAddComponent;

  modelName = 'Taxes';
  inlineMode = true;
  prependAddButton = true;
  sliderContainerId = 'taxesTemplateSlider';

  constructor(templateService: TaxTemplateRESTService,
              router: Router,
              route: ActivatedRoute,
              flash: FlashMessageService,
              modal: Modal,
              private signal: SignalService) {
    super(router, route, flash, modal);
    this.templateService = templateService;

    this.signal.stream
      .filter(message => message.group === 'taxesTemplate')
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
