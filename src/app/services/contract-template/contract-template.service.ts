import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import 'rxjs/Rx';

import { ContractTemplate } from '../../models/contract-template.model';
import { TemplateVariable } from '../../models/template-variable.model';
import { BaseTemplateService } from '../base-template/base-template.service';


@Injectable()
export class ContractTemplateService extends BaseTemplateService<ContractTemplate> {

  baseUrl = 'template/legal_document_template';

  variables(): Observable<TemplateVariable[]> {
    return this.listGet('variables');
  }

  /**
   * Format the contactTemplate data recived from api
   * @param {Object}
   */
  private formatContractTemplate(contractTemplate: ContractTemplate) {
    return contractTemplate;
  }
}
