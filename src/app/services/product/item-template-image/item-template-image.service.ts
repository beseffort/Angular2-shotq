import { Injectable } from '@angular/core';
import 'rxjs/Rx';
/* Services */
import { RestClientService } from '../../rest-client/rest-client.service';
import { ItemTemplateImage } from '../../../models/item-template-image';
declare let require: (any);

@Injectable()
export class ItemTemplateImageService extends RestClientService<ItemTemplateImage> {
  baseUrl = 'product/itemtemplateimage';
}
