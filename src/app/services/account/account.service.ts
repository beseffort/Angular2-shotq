import { Injectable } from '@angular/core';
import 'rxjs/Rx';
import { Account } from '../../models/account';
import { RestClientService } from '../rest-client/rest-client.service';

@Injectable()
export class AccountService extends RestClientService<Account> {
  baseUrl = 'account/account';

}
