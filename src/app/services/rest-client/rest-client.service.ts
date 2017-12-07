import moment from 'moment';
import { Http, URLSearchParams } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import { ApiService } from '../api/api.service';

export type HTTP_METHODS = 'get'|'post'| 'put'| 'patch'| 'delete';

type ChangedData = number|number[]|void;

@Injectable()
export class RestClientService<T> {
  // TODO: define primary key explicitly
  public apiUrl: string = ``;
  public baseUrl: string;

  // This event is emitted when the changes has been successfully sent to the server.
  // Any client interested in receiving notification when the local data
  // should be updated, should subscribe to this event.
  remoteDataHasChanged = new Subject<ChangedData>();

  public static _getSearchParams(params): URLSearchParams {
    let res: URLSearchParams = new URLSearchParams();
    let val;
    for (let k of Object.keys(params)) {
      val = params[k];
      if (val instanceof Date || moment.isMoment(val)) {
        val = val.toISOString();
      }
      res.set(k, val);
    }

    return res;
  }

  constructor(public apiService: ApiService) {
  }

  _getListUrl(): string {
    return `${this.apiUrl}/${this.baseUrl}/`;
  }

  _getItemUrl(id): string {
    return `${this.apiUrl}/${this.baseUrl}/${id}/`;
  }

  getList(queryParams = {}) {
    return this.apiService.get(this._getListUrl(), null, RestClientService._getSearchParams(queryParams));
  }

  get(id, queryParams = {}): Observable<T> {
    return this.apiService.get(this._getItemUrl(id), null, RestClientService._getSearchParams(queryParams));
  }

  itemGet(id: number, action: string, queryParams = {}): Observable<any> {
    return this.apiService.get(`${this._getItemUrl(id)}${action}/`, null, RestClientService._getSearchParams(queryParams));
  }

  itemPost(id: number, action: string, data: {} = {}): Observable<any> {
    return this.apiService.post(`${this._getItemUrl(id)}${action}/`, data)
      .do(() => this.remoteDataHasChanged.next(id));
  }

  itemPatch(id: number, action: string, data: {} = {}): Observable<any> {
    return this.apiService.patch(`${this._getItemUrl(id)}${action}/`, data)
      .do(() => this.remoteDataHasChanged.next(id));
  }

  itemPut(id: number, action: string, data: {} = {}): Observable<any> {
    return this.apiService.put(`${this._getItemUrl(id)}${action}/`, data)
      .do(() => this.remoteDataHasChanged.next(id));
  }

  listGet(action: string, queryParams = {}): Observable<any> {
    return this.apiService.get(`${this._getListUrl()}${action}/`, null, RestClientService._getSearchParams(queryParams));
  }

  listPost(action: string, data: any): Observable<any> {
    return this.apiService.post(`${this._getListUrl()}${action}/`, data)
      .do(() => this.remoteDataHasChanged.next());
  }

  listPatch(action: string, data: {} = {}): Observable<any> {
    return this.apiService.patch(`${this._getListUrl()}${action}/`, data)
      .do(() => this.remoteDataHasChanged.next());
  }

  listPut(action: string, data: {} = {}): Observable<any> {
    return this.apiService.put(`${this._getListUrl()}${action}/`, data)
      .do(() => this.remoteDataHasChanged.next());
  }

  bulkPatch(data: Array<{ id: Number }>) {
    return this.apiService.patch(`${this._getListUrl()}`, data);
  }

  save(item): Observable<T> {
    if (!item.id)
      return this.create(item);
    return this.update(item.id, item);
  }

  update(id, data: T): Observable<T> {
    return this.apiService.put(`${this._getItemUrl(id)}`, data)
      .do(() => this.remoteDataHasChanged.next(id));
  }

  partialUpdate(id, data): Observable<T> {
    return this.apiService.patch(`${this._getItemUrl(id)}`, data)
      .do(() => this.remoteDataHasChanged.next(id));
  }

  create(item): Observable<T> {
    item.account = this.apiService.getAccount();
    return this.apiService.post(this._getListUrl(), item)
      .do(() => this.remoteDataHasChanged.next());
  }

  delete(id: number): Observable<any> {
    return this.apiService.delete(this._getItemUrl(id))
      .do(() => this.remoteDataHasChanged.next(id));
  }

  bulkCreate(itemList: any[]): Observable<T> {
    // item.account = this.apiService.getAccount();
    return this.apiService.post(this._getListUrl(), itemList)
      .do(() => this.remoteDataHasChanged.next());
  }

  bulkUpdate(itemList: any[]): Observable<T> {
    return this.apiService.put(this._getListUrl(), itemList)
      .do(() => this.remoteDataHasChanged.next());
  }

}
