import { Injectable } from '@angular/core';
import { ApiService } from '../../api';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { Account } from '../../models/account';

@Injectable()
export class LegalDocumentService {
  contractsInfoEndpoint: string = '/legaldocument/legaldocument/';

  constructor(private apiService: ApiService) {
  }

  /**
   * Get contact info by job id.
   * @param {number} id The job id to search information.
   */
  public getContractsInfoByJob(id: number, statuses = ['sent', 'viewed', 'pending', 'signed']) {
    let status_filter = statuses.join('&status=');
    let path = `${this.contractsInfoEndpoint}?job=${id}&status=${status_filter}`;
    return this.apiService.get(path);
  }
}

