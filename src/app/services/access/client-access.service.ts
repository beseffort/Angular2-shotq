import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { AccessService } from '../../services/access';


@Injectable()
export class ClientAccessAuthGuard implements CanActivate {
  constructor(private accessService: AccessService) {

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    if (route.queryParams['access_token']) {
      let OAuthInfo = JSON.stringify({
        access_token: route.queryParams['access_token'],
        token_type: 'Bearer',
        is_client_token: true
      });
      sessionStorage.setItem('OAuthInfo', OAuthInfo);
      this.accessService.setCredentials();
      return this.accessService.getLoggedAccountId().map(data => true);
    }
    return Observable.of(this.accessService.getCanAccess());
  }
}
