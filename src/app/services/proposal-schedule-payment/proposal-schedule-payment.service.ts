import { Injectable } from '@angular/core';
import { ApiService } from '../api';
import { RestClientService } from '../rest-client/rest-client.service';
import { ProposalService } from '../proposal';
import { ProposalSchedulePayment } from '../../models/proposal-schedule-payment';

@Injectable()
export class ProposalSchedulePaymentService  extends RestClientService<ProposalSchedulePayment> {
  baseUrl = 'booking/proposalschedulepayment';

  constructor(
    apiService: ApiService,
    private proposalService: ProposalService) {
      super(apiService);
    }

  update(data) {
    return super.update(data.id, data).do(() => {
      this.proposalService.settingsChanged.next();
    });
  }

  delete(pk) {
    return super.delete(pk).do(() => {
      this.proposalService.settingsChanged.next();
    });
  }
}
