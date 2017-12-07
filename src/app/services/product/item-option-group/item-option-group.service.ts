import { Injectable } from '@angular/core';
import 'rxjs/Rx';
/* Services */
import { RestClientService } from '../../rest-client/rest-client.service';
import { ItemOptionGroup } from '../../../models/item-option-group';
declare let require: (any);

@Injectable()
export class ItemOptionGroupService extends RestClientService<ItemOptionGroup> {
  baseUrl = 'product/itemoptiongroup';
}
