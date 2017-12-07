import { Injectable } from '@angular/core';
import 'rxjs/Rx';
/* Services */
/* Models */
import { PackageCategory } from '../../../models/package-category';
import { RestClientService } from '../../rest-client/rest-client.service';
declare let require: (any);

@Injectable()
export class PackageCategoryService extends RestClientService<PackageCategory> {
  baseUrl = 'product/packagecategory';
}
