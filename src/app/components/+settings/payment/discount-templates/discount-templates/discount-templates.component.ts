import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import * as _ from 'lodash';
import 'slick-carousel';
import { Modal } from 'single-angular-modal/plugins/bootstrap';

import { DiscountTemplate } from '../../../../../models/discount-template.model';
import { BaseTemplateListComponent } from '../../../templates/base-template-list.component';
import { DiscountTemplateService } from '../../../../../services/discount-template/discount-template.service';
import { FlashMessageService } from '../../../../../services/flash-message/flash-message.service';
import { SignalService } from '../../../../../services/signal-service/signal.service';
import { DiscountTemplateAddComponent } from '../discount-template-add/discount-template-add.component';


@Component({
  selector: 'app-discount-templates',
  templateUrl: '../../../templates/base-template-list.component.html',
  styleUrls: ['../../../templates/base-template-list.component.scss'],
})
export class DiscountTemplatesComponent extends BaseTemplateListComponent<DiscountTemplate> {
  @ViewChild('modifyDiscountTemplate') public modifyDiscountTemplate: DiscountTemplateAddComponent;
  modelName = 'Discount';
  inlineMode = true;
  prependAddButton = true;
  sliderContainerId = 'discountTemplateSlider';

  constructor(templateService: DiscountTemplateService,
              router: Router,
              route: ActivatedRoute,
              flash: FlashMessageService,
              modal: Modal,
              private signal: SignalService) {
    super(router, route, flash, modal);
    this.templateService = templateService;

    this.signal.stream
      .filter(message => message.group === 'discountTemplate')
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
    this.modifyDiscountTemplate.show(template);
  }

  openTemplate(template) {
    this.modifyDiscountTemplate.show(template);
  }

  addTemplateClick() {
    this.modifyDiscountTemplate.show();
  }

}
