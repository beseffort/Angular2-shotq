import { Injectable }              from '@angular/core';
import { Observable }              from 'rxjs/Observable';
import { Headers }                 from '@angular/http';
import 'rxjs/Rx';
/* Services */
import { ApiService }              from '../../api';
declare let require: (any);

@Injectable()
export class PackageService {
  private packageJobEP: string = '/product/package/?proposal__job=';

  /**
   * Initialize services
   * @param {ApiService} private apiService [description]
   */
  constructor(private apiService: ApiService) {}

  /**
   * Function to get the job's package info
   * @param {number} jobId [description]
   */
  public getJobPackage(jobId: number) {
    return this.apiService.get(`${this.packageJobEP}${jobId}`)
      .map(response => response.results);
  }
}
