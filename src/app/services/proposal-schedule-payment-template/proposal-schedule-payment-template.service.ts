import { Injectable }              from '@angular/core';

import { ProposalSchedulePaymentTemplate } from '../../models/proposal-schedule-payment-template';
import { BaseProposalSchedulePaymentItem } from '../../models/base-proposal-schedule-payment-item';
import { BaseTemplateService } from '../base-template/base-template.service';

@Injectable()
export class ProposalSchedulePaymentTemplateService extends BaseTemplateService<ProposalSchedulePaymentTemplate> {
  baseUrl = 'booking/proposalschedulepaymenttemplate';

  generatePaymentTitle(data: BaseProposalSchedulePaymentItem) {
    return this.listPost('generate_payment_title', data);
  }
}
