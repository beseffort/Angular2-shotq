import { Injectable } from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { Email } from '../../models/email';

@Injectable()
export class EmailService extends RestClientService<Email> {
  baseUrl = 'person/email';

  update(data) {
    return super.update(data.pk, data);
  }
}
