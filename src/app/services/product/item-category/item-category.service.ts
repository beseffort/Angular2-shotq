import { Injectable } from '@angular/core';
import 'rxjs/Rx';
/* Services */
/* Models */
import { ItemCategory } from '../../../models/item-category';
import { RestClientService } from '../../rest-client/rest-client.service';
declare let require: (any);

@Injectable()
export class ItemCategoryService extends RestClientService<ItemCategory> {
  baseUrl = 'product/itemcategory';

}
