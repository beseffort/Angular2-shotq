import { Injectable } from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { Phone } from '../../models/phone';

@Injectable()
export class PhoneService extends RestClientService<Phone> {
  baseUrl = 'person/phone';

  update(data) {
    return super.update(data.pk, data);
  }
}
