import { Injectable }              from '@angular/core';
import { Observable }              from 'rxjs/Observable';
import { Headers }                 from '@angular/http';
import 'rxjs/Rx';
/* Services */
import { ApiService }              from '../../api';
import { RestClientService } from '../../rest-client/rest-client.service';
import { ProductTemplateService } from '../product-template';
import { ItemTemplate } from '../../../models/item-template';
declare let require: (any);

@Injectable()
export class ItemTemplateService extends ProductTemplateService<ItemTemplate> {
  baseUrl = 'product/itemtemplate';

  private searchItemEndpoint: string = '/product/itemtemplate/?search=';
  private _ = require('../../../../../node_modules/lodash');

  /**
   * Get the item list
   */
  public getList(params: any = {}) {
    return super.getList(params)
      .map(res => ({
        results: res.results.filter(item => item.status !== 'deleted'),
        count: res.count
      }));
  }

  /**
   * Function to serach items by search term
   *
   * @param  {string}     searchTerm The search term (name).
   * @return {Obserbable} The observable.
   */
  public search(searchTerm: string, params: any = {page: 1, per_page: 10}): Observable<any> {
    if (params.categories === undefined) {
      delete params['categories'];
    }
    if (params.status === undefined) {
      delete params['status'];
    }
    let queryString = this._.map(params, (v, k) => `${k}=${v}`).join('&');
    return this.apiService.get(`${this.searchItemEndpoint}${searchTerm}&${queryString}`)
      .map(response => {
        return {
          items: response.results.filter(function (obj) {
            if (obj.hasOwnProperty('status') || obj.hasOwnProperty('item_type')
              && (obj.status === 'active' && (obj.item_type === 'product' || obj.item_type === 'service'))) {
              return obj;
            }
          }), total: response.count
        };
      });
  }

  bulkAdjustStatus(data) {
    data.item_templates = data.templates;
    return super.bulkAdjustStatus(data);
  }

  public createItem(itemTemplateId: number) {
    return this.itemPost(itemTemplateId, `create_item`);
  }
}
