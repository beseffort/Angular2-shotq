import { Injectable } from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { EmailType } from '../../models/email-type';

@Injectable()
export class EmailTypeService extends RestClientService<EmailType> {
  baseUrl = 'person/email_type';

  public static newObject(data?: object): EmailType {
    return Object.assign(new EmailType(), data || {});
  }

}
