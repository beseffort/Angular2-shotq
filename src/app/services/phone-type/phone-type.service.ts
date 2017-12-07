import { Injectable } from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { PhoneType } from '../../models/phone-type';

@Injectable()
export class PhoneTypeService extends RestClientService<PhoneType> {
  baseUrl = 'person/phone_type';

  public static newObject(data?: object): PhoneType {
    return Object.assign(new PhoneType(), data || {});
  }
}
