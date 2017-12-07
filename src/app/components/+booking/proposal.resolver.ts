/**
 * Created by dxs on 15.03.17.
 */
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProposalService } from '../../services/proposal/proposal.service';

@Injectable()
export class ProposalResolver implements Resolve<any> {

  constructor(private proposalService: ProposalService) {

  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>|Promise<any>|any {
    return this.proposalService.get(parseInt((<any>route.params).id, 10));
  }
}
