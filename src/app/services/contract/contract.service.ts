import { Injectable } from '@angular/core';
import { ApiService } from '../api';
import { GeneralFunctionsService } from '../general-functions';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { Contract } from '../../models/contract';
import { TemplateVariableService } from '../template-variable/template-variable.service';
import { TemplateVariable } from '../../models/template-variable.model';
import { RestClientService } from '../rest-client/rest-client.service';
declare let require: (any);

/* Models */

@Injectable()
export class ContractService extends RestClientService<Contract> {
  /* Endpoints */

  baseUrl = 'legaldocument/legaldocument';
  // Fields endpoint
  private _ = require('../../../../node_modules/lodash');

  public static newObject(data?: object): Contract {
    return Object.assign(new Contract(), data || {});
  }

  // Initialize services
  constructor(apiService: ApiService,
              private functions: GeneralFunctionsService,
              private tempVarService: TemplateVariableService) {
    super(apiService);
  }

  /**
   * Function to send contract
   *
   * @param {number} id The contact id.
   */

  send(id: number) {
    return this.itemPost(id, 'send');
  }

  /**
   * Function to get preview on contract contens.
   *
   * @param {number} id The contact id.
   */
  public preview(id: number) {
    return this.itemGet(id, 'preview');
  }

  checkForErrors(contract: Contract): Observable<TemplateVariable[]> {
    return this.tempVarService.getList()
      .map(res => {
        let varList = res.results;
        let errors: TemplateVariable[] = [];
        let re = /(\{\{([\w.]+)}})/gm;
        let match = re.exec(contract.contents);
        while (match != null) {
          let varName = match[2];
          let tempVar = varList.find(item => item.key === varName);
          if (!tempVar && errors.findIndex(item => item.key === varName) === -1) {
            tempVar = {
              name: varName,
              key: varName,
            };
            errors.push(tempVar);
          }
          match = re.exec(contract.contents);

        }
        return errors;
      });
  }

  mySignature(contractId: number) {
    return this.itemGet(contractId, 'my_signature');
  }
}
