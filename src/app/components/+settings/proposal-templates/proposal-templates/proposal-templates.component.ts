import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Modal } from 'single-angular-modal/plugins/bootstrap';

import { ProposalTemplate } from '../../../../models/proposal-template';
import { ProposalTemplateService } from '../../../../services/proposal-template';
import { BaseTemplateListComponent } from '../../templates/base-template-list.component';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';

@Component({
  selector: 'app-contract-templates',
  templateUrl: '../../templates/base-template-list.component.html',
  styleUrls: ['../../templates/base-template-list.component.scss'],
})
export class ProposalTemplatesComponent extends BaseTemplateListComponent<ProposalTemplate> {
  modelName = 'Proposal';
  inlineMode = true;
  prependAddButton = true;
  sliderContainerId = 'proposalTemplateSlider';

  constructor(
    router: Router,
    route: ActivatedRoute,
    flash: FlashMessageService,
    modal: Modal,
    proposalTemplateService: ProposalTemplateService,
  ) {
    super(router, route, flash, modal);
    this.templateService = proposalTemplateService;
  }

}
