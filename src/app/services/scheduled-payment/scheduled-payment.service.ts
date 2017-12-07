import { RestClientService } from '../rest-client/rest-client.service';
import { ScheduledPayment } from '../../models/scheduled-payment.model';

export class ScheduledPaymentService extends RestClientService<ScheduledPayment> {
  baseUrl = 'billing/scheduled_payment';

  getGatewayData(id: number) {
    return this.itemGet(id, 'gateway_data');
  }

  markAsPaid(id: number) {
    return this.itemPost(id, 'mark_as_paid');
  }

  refund(id: number) {
    return this.itemPost(id, 'refund');
  }
  void_schedule(id: number) {
    return this.itemPost(id, 'void_schedule');
  }
}
