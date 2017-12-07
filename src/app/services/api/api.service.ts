import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/Rx';
import 'rxjs/add/observable/throw';
declare let process: (any);

@Injectable()
export class ApiService {
  headers: Headers;

  // public apiUrl: string = process.env.APICONFIG.apiUrl;
  // public oAuthUrl: string = process.env.APICONFIG.oAuthUrl;
  public apiUrl: string = 'http://shootq-base.test.gearheart.io/api/v1';
  public oAuthUrl: string = 'http://shootq-base.test.gearheart.io';

  public auth = {
    id: process.env.APICONFIG.account_id,
    user: process.env.APICONFIG.account_username,
    password: process.env.APICONFIG.account_password
  };

  private oAuthAuthorization: string = '';

  constructor(private http: Http, private router: Router) {
    this.setHeaders();
  }

  /**
   * Set API call header
   */
  public setHeaders(id?: number) {
    let oAuthTokenRaw = sessionStorage.getItem('OAuthInfo');
    let accountInfoRaw = sessionStorage.getItem('accountInfo');
    let oAuthTokenInfo = JSON.parse(oAuthTokenRaw);
    let accountInfo = JSON.parse(accountInfoRaw);
    // Set proper account id.
    if (accountInfo !== undefined && accountInfo !== null && accountInfo[0].id) {
      this.auth.id = accountInfo[0].id;
    }
    if (oAuthTokenInfo !== undefined &&
        oAuthTokenInfo !== null &&
        oAuthTokenInfo.access_token !== undefined &&
        oAuthTokenInfo.access_token !== null &&
        oAuthTokenInfo.access_token !== '') {
          this.headers = new Headers({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `${oAuthTokenInfo.token_type} ${oAuthTokenInfo.access_token}`
          });
        this.oAuthAuthorization = `${oAuthTokenInfo.token_type} ${oAuthTokenInfo.access_token}`;
    }
  }
  /**
   * Get account id.
   */
  public getAccount() {
    return this.auth.id || process.env.APICONFIG.account_id;
  }

  /**
   * Function to get the API url.
   *
   * @return {string} [description]
   */
  getApiUrl(): string {
    return this.apiUrl;
  }

  /**
   * Function to handle get requests
   * @param  {string}          path The url path to the endpoint
   * @return {Observable<any>} The observable object that retrieve the response data.
   */
  get(path: string, headers?, search?): Observable<any> {
    if (headers) {
      this.headers = headers;
    }
    return this.http.get(`${this.apiUrl}${path}`, {headers: this.headers, search: search})
      .map(this.checkForError)
      .catch(err => Observable.throw(err))
      .map(this.getJson);
  }
  /**
   * Function to get File
   * @param  {string}          path The url path to the endpoint
   * @return {Observable<any>} The observable object that retrieve the response data.
   */
  getFile(path: string, headers?): Observable<any> {
    if (headers) {
      this.headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': headers.accept,
            'Authorization': this.oAuthAuthorization
          });
    }
    let response = this.http.get(`${this.apiUrl}${path}`, {headers: this.headers})
      .map(this.checkForError)
      .catch(err => Observable.throw(err))
      .map(data => data);
    this.setHeaders();
    return response;
  }

  /**
   * Function to handle post requests
   *
   * @param  {string}          path The url path to the endpoint
   * @param  {json}          body the body data to send in post.
   * @return {Observable<any>} The observable object that retrieve the response data.
   */
  post(path: string, body?, headers?): Observable<any> {
    if (headers) {
      // using custom heaeders
      this.headers = headers;
    }
    return this.http.post(
      `${this.apiUrl}${path}`,
      JSON.stringify(body),
      {headers: this.headers}
    )
      .map(this.checkForError)
      .catch(err => Observable.throw(err))
      .map(this.getJson);
  }
  /**
   * Function to handle post requests
   *
   * @param  {string}          path The url path to the endpoint
   * @param  {json}          body the body data to send in post.
   * @return {Observable<any>} The observable object that retrieve the response data.
   */
  oAuthPost(path: string, body, headers?): Observable<any> {
    if (headers) {
      // using custom heaeders
      this.headers = headers;
    }
    return this.http.post(
      `${this.oAuthUrl}${path}`,
      body,
      {headers: this.headers}
    )
      .map(this.checkForError)
      .catch(err => Observable.throw(err))
      .map(this.getJson);
  }

  /**
   * Function to handle put requests
   *
   * @param  {string}          path The url path to the endpoint
   * @param  {json}          body the body data to send in post.
   * @return {Observable<any>} The observable object that retrieve the response data.
   */
  put(path: string, body, headers?): Observable<any> {
    if (headers) {
      // using custom heaeders
      this.headers = headers;
    }
    return this.http.put(
      `${this.apiUrl}${path}`,
      JSON.stringify(body),
      {headers: this.headers}
    )
      .map(this.checkForError)
      .catch(err => Observable.throw(err))
      .map(this.getJson);
  }

  /**
   * Function to handle patch requests
   *
   * @param  {string}        path The url path to the endpoint
   * @param  {json}          body the body data to send in post.
   * @return {Observable<any>} The observable object that retrieve the response data.
   */
  patch(path: string, body: any): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}${path}`,
      JSON.stringify(body),
      {headers: this.headers}
    )
      .map(this.checkForError)
      .catch(err => Observable.throw(err))
      .map(this.getJson);
  }

  /**
   * Function to handle delete requests
   * @param  {string}          path The url path to the endpoint
   * @return {Observable<any>} The observable object that retrieve the response data.
   */
  delete(path: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}${path}`,
      {headers: this.headers}
    )
      .map(this.checkForError)
      .catch(err => Observable.throw(err));
  }

  /**
   * Function to get basic auth through API.
   *
   * @return {string} [description]
   */
  public getBasicAuth(): string {
    return 'Basic ' + btoa(this.auth.user + ':' + this.auth.password);
  }

  /**
   * Function to get basic auth through API.
   *
   * @return {string} [description]
   */
  public getOauthAutorization(): string {
    return this.oAuthAuthorization;
  }

  /**
   * Function to get json response data.
   *
   * @param {Response} response [description]
   */
  private getJson(response: Response) {
    return response.json();
  }

  /**
   * Private function to handle errors.
   *
   * @param  {Response} response [description]
   * @return {Response}          [description]
   */
  private checkForError(response: Response): Response {
    if (response.status >= 200 && response.status < 300) {
      return response;
    } else {
      let error = new Error(response.statusText);
      error['response'] = response;
      console.error(error);
      throw error;
    }
  }
}
