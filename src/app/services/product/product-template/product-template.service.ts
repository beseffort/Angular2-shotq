import { RestClientService } from '../../rest-client/rest-client.service';


export class ProductTemplateService<ModelClass> extends RestClientService<any> {

  bulkAdjustPrice(data) {
    return this.listPost('bulk_adjust_price', data);
  }

  bulkAdjustStatus(data) {
    return this.listPost('bulk_adjust_status', data);
  }

  clone(productId: number) {
    return this.itemPost(productId, 'clone');
  }
}
