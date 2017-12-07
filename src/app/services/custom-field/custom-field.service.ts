import { Injectable } from '@angular/core';
import { ApiService } from '../api';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

@Injectable()
export class CustomFieldService {
  // Custom Field endpoint
  personEndpoint: string = '/person/customfield/';

  constructor(private apiService: ApiService) {
  }

  /**
   * Function to create custom field using API endpoint.
   *
   * @param {Array} data the form data to make body and perform the post.
   */
  public create(data) {
    return this.apiService.post(this.personEndpoint, data, '');
  }

  /**
   * Function to update custom field using API endpoint.
   *
   * @param {Array} data the form data to make body and perform the post.
   */
  public update(data) {
    return this.apiService.put(`${this.personEndpoint}${data.pk}/`, data, '');
  }

  /**
   * Function to delete custom field using API endpoint.
   *
   * @param {number} id [custom field id to delete]
   */
  public delete(id: number) {
    return this.apiService.delete(`${this.personEndpoint}${id}/`);
  }
}
