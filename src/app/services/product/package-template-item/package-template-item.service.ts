import { Injectable }              from '@angular/core';
import { Observable }              from 'rxjs/Observable';
import { Headers }                 from '@angular/http';
import 'rxjs/Rx';
/* Services */
import { ApiService }              from '../../api';
import { RestClientService } from '../../rest-client/rest-client.service';
import { PackageTemplateItem } from '../../../models/package-template-item';
declare let require: (any);

@Injectable()
export class PackageTemplateItemService extends RestClientService<PackageTemplateItem> {
  baseUrl = 'product/packagetemplateitem';
  private searchPackageTemplateItemEP: string = '/product/packagetemplateitem/?search=';
  private _ = require('../../../../../node_modules/lodash');


  /**
   * Get the package template item list
   */
  public getList(params: any = {}) {
    return super.getList(params)
      .map(data => {
        data.results = data.results.filter(item => (item.status !== 'archived'));
        return data;
      });
  }

  /**
   * Function to serach packages template items by search term
   *
   * @param  {string}     searchTerm The search term (name).
   * @return {Obserbable} The observable.
   */
  public search(searchTerm: string, params: Object = {page: 1, per_page: 10}): Observable<any> {
    let queryString = this._.map(params, (v, k) => `${k}=${v}`).join('&');
    return this.apiService.get(`${this.searchPackageTemplateItemEP}${searchTerm}&${queryString}`)
      .map(response => {
        return {
          items: response.results.filter(function (obj) {
            return obj;
          }), total: response.count
        };
      });
  }
}
