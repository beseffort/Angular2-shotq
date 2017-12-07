import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Proposal } from '../../../../models/proposal';
import { TaxService } from '../../../../services/tax/tax.service';
import { Tax } from '../../../../models/tax.model';
import { TaxTemplateRESTService } from '../../../../services/tax-template/tax-template.service';
import { Observable } from 'rxjs';
import { TaxTemplate } from '../../../../models/tax-template.model';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import { ProposalService } from '../../../../services/proposal';
import { BaseTaxDiscountsComponent } from '../shared/proposal-base-taxes-discounts.component';
@Component({
  selector: 'app-proposal-taxes',
  templateUrl: './proposal-taxes.component.html',
})
export class ProposalTaxesComponent extends BaseTaxDiscountsComponent<Tax, TaxTemplate> {

  modelName = 'Tax';
  header = '3. Configure Taxes';

  constructor(private flashService: FlashMessageService,
              taxService: TaxService,
              proposalService: ProposalService,
              templateService: TaxTemplateRESTService) {
    super(flashService, proposalService);

    this.objectService = taxService;
    this.templateService = templateService;
  }

  createObject(e, objTemplate?: TaxTemplate) {
    if (this.objects.length) {
      e.preventDefault();
      this.flashService.error('Proposal can have only one tax, please remove existing taxes before create new.');
      return;
    }
    super.createObject(e, objTemplate);
  }

}
