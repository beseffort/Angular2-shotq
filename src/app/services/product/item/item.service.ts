import { Injectable } from '@angular/core';
import 'rxjs/Rx';
/* Services */
import { ApiService } from '../../api';
/* Models */
import { Item } from '../../../models/item';
import { RestClientService } from '../../rest-client/rest-client.service';
declare let require: (any);

@Injectable()
export class ItemService extends RestClientService<Item> {
  baseUrl = 'product/item';

  constructor(apiService: ApiService) {
    super(apiService);
  }

}
