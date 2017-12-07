import { Injectable } from '@angular/core';
import { ApiService } from '../../api';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { RestClientService } from '../../rest-client/rest-client.service';
import { Invoice } from '../../../models/invoice';

@Injectable()
export class InvoiceService extends RestClientService<Invoice> {
  baseUrl = 'billing/invoice';

  /**
   * Get job invoices.
   * @param {number} id The job id
   */
  public getInvoiceInfoByJob(id: number, search?: any) {
    search = search || {};
    Object.assign(search, {
      billing_order__job: id
    });
    return this.getList(search)
      .map(response => response.results);
  }

  public getInvoicesByContact(id: number, search: any = {}) {
    Object.assign(search, {
      billing_order__contact: id
    });
    return this.getList(search)
      .map(response => response.results);
  }

  getOutstanding(): Observable<{amount: number, invoices_count: number}> {
    return this.listGet('outstanding');
  }
}
