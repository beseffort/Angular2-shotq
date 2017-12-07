import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { Worker } from '../../models/worker';

@Injectable()
export class WorkerService extends RestClientService<Worker> {
  baseUrl = 'person/worker';

  searchWorker(searchTerm: string, params: Object = {page: 1, per_page: 10, active: 'True'}) {
    let queryParams = _.assignIn({}, {search: searchTerm}, params);
    return this.getList(queryParams)
      .map(response => {
        return {workers: response.results.filter(function(obj) {
          return  obj;
        }), total: response.count};
      });
  }
}
