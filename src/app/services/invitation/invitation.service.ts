import { Injectable } from '@angular/core';
import 'rxjs/Rx';
import { Account } from '../../models/account';
import { RestClientService } from '../rest-client/rest-client.service';

@Injectable()
export class InvitationService extends RestClientService<Account> {
  baseUrl = 'person/invitation';


  cancel(signed_id: string) {
    return this.apiService.post(`/${this.baseUrl}/cancel/`, {'user': signed_id});
  }

  resend(signed_id: string) {
    return this.apiService.post(`/${this.baseUrl}/resend/`, {'user': signed_id});
  }

  setPassword(signed_id: string, password: string) {
    return this.apiService.post(`/${this.baseUrl}/set_password/`, {'user': signed_id, 'password': password}, {'Content-Type': 'application/json'});
  }

}
