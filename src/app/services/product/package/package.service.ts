import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
/* Services */
import { RestClientService } from '../../rest-client/rest-client.service';
import { Package } from '../../../models/package';
declare let require: (any);

@Injectable()
export class PackageService extends RestClientService<Package> {
  baseUrl = 'product/package';
  private searchPackageEP: string = '/product/package/?search=';
  private functions: any;
  private _ = require('../../../../../node_modules/lodash');

  /**
   * Get the package template item list
   */
  public getList(params: any = {}) {
    return super.getList(params)
      .map(res => {
        res.results = res.results.filter(item => item.status !== 'archived');
        return res;
      });
  }

  /**
   * Function to serach packages template items by search term
   *
   * @param  {string}     searchTerm The search term (name).
   * @return {Obserbable} The observable.
   */
  public search(searchTerm: string, params: any = {page: 1, per_page: 10}): Observable<any> {
    if (params.category === undefined) {
      delete params['category'];
    }
    if (params.status === undefined) {
      delete params['status'];
    }
    let queryString = this._.map(params, (v, k) => `${k}=${v}`).join('&');
    return this.apiService.get(`${this.searchPackageEP}${searchTerm}&${queryString}`)
      .map(response => {
        return {
          items: response.results.filter(function (obj) {
            return obj;
          }), total: response.count
        };
      });
  }

  /**
   * Function to clone a package item template.
   * @param {number} itemId [description]
   */
  public clone(itemId: number) {
    return this.itemPost(itemId, 'clone');
  }
}
