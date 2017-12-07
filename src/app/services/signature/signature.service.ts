import { Injectable } from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { Signature } from '../../models/signature.model';

@Injectable()
export class SignatureService extends RestClientService<Signature> {
  baseUrl = 'legaldocument/signature';

  create(data: Signature) {
    data.account = this.apiService.getAccount();
    return super.create(data);
  }
}
