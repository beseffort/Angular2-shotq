/**
 * Created by dxs on 15.03.17.
 */
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProposalService } from '../../services/proposal/proposal.service';
import { ProposalSchedulePaymentService } from '../../services/proposal-schedule-payment/proposal-schedule-payment.service';

@Injectable()
export class ProposalScheduleResolver implements Resolve<any> {

  constructor(private scheduleService: ProposalSchedulePaymentService) {

  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>|Promise<any>|any {
    return this.scheduleService.getList({proposal: parseInt((<any>route.params).id, 10)});
  }
}
