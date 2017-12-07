import { Injectable } from '@angular/core';
import 'rxjs/Rx';
/* Services */
import { ItemTemplateOption } from '../../../models/item-template-option';
import { RestClientService } from '../../rest-client/rest-client.service';
declare let require: (any);

@Injectable()
export class ItemTemplateOptionService extends RestClientService<ItemTemplateOption> {
  baseUrl = 'product/itemtemplateoption';
}
