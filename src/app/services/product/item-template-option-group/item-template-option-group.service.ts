import { Injectable } from '@angular/core';
import 'rxjs/Rx';
/* Services */
import { RestClientService } from '../../rest-client/rest-client.service';
import { ItemTemplateOptionGroup } from '../../../models/item-template-option-group';
declare let require: (any);

@Injectable()
export class ItemTemplateOptionGroupService extends RestClientService<ItemTemplateOptionGroup> {
  baseUrl = 'product/itemtemplateoptiongroup';
}
