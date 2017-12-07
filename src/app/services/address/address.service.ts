import { Injectable } from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { Address } from '../../models/address';

@Injectable()
export class AddressService  extends RestClientService<Address> {
  baseUrl = 'person/address';

  update(data) {
    return super.update(data.pk, data);
  }
}
