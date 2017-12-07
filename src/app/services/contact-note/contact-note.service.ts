import { Injectable } from '@angular/core';
import { ApiService } from '../api';
import { Observable } from 'rxjs/Observable';
declare let require: (any);

@Injectable()
export class ContactNoteService {

  private endpoint = '/person/contactnote/';
  private personNoteEndpoint: any = '/person/contact/:note_id/notes/';
  private _ = require('../../../../node_modules/lodash');

  constructor(private apiService: ApiService) {
  }
  /**
   * Get notes list.
   * @param {Object} params [description]
   */
  public getList(params: any) {
    let queryString = this._.map(params, (v, k) => `${k}=${v}`).join('&');
    return this.apiService.get(`${this.endpoint}?${queryString}`)
      .map(response => {
        return {contactNotes: response.results, total: response.count};
      });
  }
  /**
   * Get notes list by contact.
   * @param {Object} params [description]
   */
  public getListByContact(id: number, params: any) {
    let endpoint: any = this.personNoteEndpoint.replace(':note_id', id);
    let queryString = this._.map(params, (v, k) => `${k}=${v}`).join('&');
    return this.apiService.get(`${endpoint}?${queryString}`)
      .map(response => {
        return {contactNotes: response.results, total: response.count};
      });
  }
  /**
   * Create note function.
   * @param {Object} data [description]
   */
  public create(data: Object) {
    return this.apiService.post(`${this.endpoint}`, data);
  }
  /**
   * Update note function.
   * @param {Number} id [description]
   * @param {Object} data [description]
   */
  public update(id: number, data: Object = {}) {
    return this.apiService.patch(`${this.endpoint}${id}/`, data);
  }
  /**
   * Delete note function.
   * @param {Number} id [description]
   * @param {Object} data [description]
   */
  public delete(id: number) {
    return this.apiService.delete(`${this.endpoint}${id}/`);
  }
}
