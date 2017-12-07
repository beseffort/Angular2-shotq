import { Observable } from 'rxjs/Observable';
import { RestClientService } from '../rest-client/rest-client.service';
import { AppliedPayment } from '../../models/applied-payment.model';

export class AppliedPaymentService extends RestClientService<AppliedPayment> {
  baseUrl = 'billing/applied_payment';

  getIncomePaymentsStat(months_number: number = 6): Observable<{month: string, amount_sum: number}[]> {
    return this.listGet('payments_by_months', {months_number: months_number});
  }
}
