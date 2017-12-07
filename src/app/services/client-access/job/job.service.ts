import { Injectable } from '@angular/core';
import { ApiService } from '../../api';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { Account } from '../../models/account';

@Injectable()
export class JobService {
  jobEndpoint: string = '/job/job/';

  constructor(private apiService: ApiService) {
  }

  /**
   * Get jobs by id
   * @param {number} id The job id to search information.
   */
  public get(id: number) {
    return this.apiService.get(`${this.jobEndpoint}${id}/`);
  }

  /**
   * Get contact info by job id.
   * @param {number} id The job id to search information.
   */
  public getUserInfoByJob(id: number) {
    let path = `${this.jobEndpoint}${id}/`;
    return this.apiService.get(path);
  }
}
