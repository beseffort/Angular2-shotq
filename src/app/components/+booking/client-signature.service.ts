import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import {
  Router,
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { ContractService } from '../../services/contract';


@Injectable()
export class SignatureResolver implements Resolve<any> {
  constructor(
    private router: Router,
    private contractService: ContractService
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    let oAuthRawInfo = sessionStorage.getItem('OAuthInfo');
    let oAuthInfo = JSON.parse(oAuthRawInfo);
    if (!oAuthInfo['is_client_token']) {
      return Observable.of(null);
    }
    let proposal = route.parent.data['proposal'];
    return this.contractService.mySignature(proposal['contract'])
      .map((signature) => {
        if (_.isEmpty(signature)) {
          return null;
        }
        return signature;
      });
  }
}
