import { Injectable } from '@angular/core';

import { BaseTemplateService } from '../base-template/base-template.service';
import { ProposalTemplate } from '../../models/proposal-template';

@Injectable()
export class ProposalTemplateService extends BaseTemplateService<ProposalTemplate> {
  baseUrl = 'booking/proposaltemplate';
}
