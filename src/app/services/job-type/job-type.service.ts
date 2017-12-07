import { Injectable } from '@angular/core';

import * as _ from 'lodash';

import { RestClientService } from '../rest-client/rest-client.service';
import { JobType } from '../../models/job-type';

@Injectable()
export class JobTypeService extends RestClientService<JobType> {
  baseUrl = 'job/jobtype';

  public static newObject(data?: object): JobType {
    return Object.assign(new JobType(), data || {});
  }

  public getList(queryParams = {}) {
    _.defaults(queryParams, {active: true});
    return super.getList(queryParams);
  }
}
