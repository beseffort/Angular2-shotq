import { RestClientService } from '../rest-client/rest-client.service';
import { ApiService } from '../api/api.service';
import { Injectable } from '@angular/core';
import { Tax } from '../../models/tax.model';

@Injectable()
export class TaxService extends RestClientService<Tax> {
  baseUrl = 'billing/tax';

  constructor(apiService: ApiService) {
    super(apiService);
  }

}
