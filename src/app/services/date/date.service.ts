import { Injectable } from '@angular/core';
import { ApiService } from '../api';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

@Injectable()
export class DateService {
  // Phone endpoint

  private personDateTypeEndpoint: string = '/person/date_type/';

  constructor(private apiService: ApiService) {
  }

  /**
   * Function to get phones types
   *
   */
  public getTypes() {
    return this.apiService.get(this.personDateTypeEndpoint);
  }
}
