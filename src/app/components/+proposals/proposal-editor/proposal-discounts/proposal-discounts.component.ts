import { Component } from '@angular/core';
import { DiscountService, DiscountTemplateService } from '../../../../services';
import { DiscountTemplate } from '../../../../models/discount-template.model';
import { Discount } from '../../../../models/discount.model';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import { ProposalService } from '../../../../services/proposal';
import { BaseTaxDiscountsComponent } from '../shared/proposal-base-taxes-discounts.component';


@Component({
  selector: 'app-proposal-discounts',
  templateUrl: './proposal-discounts.component.html'
})
export class ProposalDiscountsComponent extends BaseTaxDiscountsComponent<Discount, DiscountTemplate> {

  modelName = 'Discount';
  header = '2. Apply a discount?';

  constructor(flash: FlashMessageService,
              discountService: DiscountService,
              templateService: DiscountTemplateService,
              proposalService: ProposalService) {
    super(flash, proposalService);

    this.objectService = discountService;
    this.templateService = templateService;
  }

}
