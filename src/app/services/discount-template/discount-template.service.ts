import { Injectable } from '@angular/core';

import { DiscountTemplate } from '../../models/discount-template.model';
import { BaseTemplateService } from '../base-template/base-template.service';

declare let require: (any);

@Injectable()
export class DiscountTemplateService extends BaseTemplateService<DiscountTemplate> {
  public baseUrl: string = 'billing/discount_template';
}
