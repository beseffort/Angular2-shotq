import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { JobService } from '../../../services/job/job.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class JobProposalResolver implements Resolve<any> {

  constructor(private jobService: JobService) {

  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return this.jobService.getOrCreateProposal(route.params.id);
  }
}
