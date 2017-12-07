import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService } from '../api';
import * as _ from '../../../../node_modules/lodash';

@Injectable()
export class JobContractInvoiceService {

  private endpoint = '/job/job/';
  private invoices = '/invoices';
  private contracts = '/contracts';

  constructor(private apiService: ApiService) {
  }

  /**
   * Function to get job's invoices
   *
   * @param {jobId} jobId [job id to get invoices from].
   */
  public getJobInvoices(jobId) {
    return this.apiService.get(`${this.endpoint}${jobId}${this.invoices}/`);
  }
  /**
   * Function to get job's contracts
   *
   * @param {jobId} jobId [job id to get invoices from].
   */
  public getJobContracts(jobId) {
    return this.apiService.get(`${this.endpoint}${jobId}${this.contracts}/`);
  }
}
