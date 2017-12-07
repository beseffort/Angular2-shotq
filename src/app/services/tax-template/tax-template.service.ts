import { Injectable } from '@angular/core';

import { ApiService } from '../api/api.service';
import { TaxTemplate } from '../../models/tax-template.model';
import { BaseTemplateService } from '../base-template/base-template.service';


@Injectable()
export class TaxTemplateRESTService extends BaseTemplateService<TaxTemplate> {

  baseUrl = 'billing/tax_template';

  constructor(public apiService: ApiService) {
    super(apiService);
  }

}
