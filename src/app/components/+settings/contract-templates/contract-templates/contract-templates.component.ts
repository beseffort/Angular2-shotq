import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Modal } from 'single-angular-modal/plugins/bootstrap';

import { ContractTemplate } from '../../../../models/contract-template.model';
import { ContractTemplateService } from '../../../../services/contract-template/contract-template.service';
import { BaseTemplateListComponent } from '../../templates/base-template-list.component';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import { BreadcrumbService } from '../../../shared/breadcrumb/components/breadcrumb.service';

@Component({
  selector: 'app-contract-templates',
  templateUrl: '../../templates/base-template-list.component.html',
  styleUrls: ['../../templates/base-template-list.component.scss'],
})
export class ContractTemplatesComponent extends BaseTemplateListComponent<ContractTemplate> {
  modelName = 'Contract';
  inlineMode = true;
  prependAddButton = true;
  sliderContainerId = 'contractTemplateSlider';

  constructor(contractTemplateService: ContractTemplateService,
              flash: FlashMessageService,
              modal: Modal,
              router: Router, route: ActivatedRoute,
              breadcrumbService: BreadcrumbService) {
    super(router, route, flash, modal);
    this.templateService = contractTemplateService;
    breadcrumbService.addFriendlyNameForRoute('/settings/templates/contract', 'Contracts');
    breadcrumbService.muteRoute('/settings/templates');
  }

}
