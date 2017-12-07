import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UUID } from 'angular2-uuid';

@Injectable()
export class StateSaverService {
  private storageKeyPrefix: string = 'sq-state-';

  constructor(private router: Router) { }

  saveState(currentUrl: string, data: any): {uuid: string, nextUrl: string} {
    let uuid = UUID.UUID();
    let stateKey = this.getStorageKey(uuid);
    sessionStorage.setItem(stateKey, JSON.stringify(data));
    let nextUrl = this.addUrlParams(currentUrl, {restorestate: uuid});
    return {uuid: uuid, nextUrl: nextUrl};
  }

  getSavedStateData(uuid: string) {
    let savedData = sessionStorage.getItem(this.getStorageKey(uuid));
    if (savedData) {
      return JSON.parse(savedData);
    }
    return savedData;
  }

  private getStorageKey(uuid: string): string {
    return `${this.storageKeyPrefix}-${uuid}`;
  }

  private addUrlParams(url: string, params: {[key: string]: string}): string {
    let parsedUrl = this.router.parseUrl(url);
    _.assignIn(parsedUrl.queryParams, params);
    return this.router.serializeUrl(parsedUrl);
  }
}
