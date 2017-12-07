import { Injectable } from '@angular/core';

import { ApiService } from '../api';


@Injectable()
export class ActivityService {
  private baseUrl: string = '/activity/feed';

  constructor(private apiService: ApiService) {}

  public account() {
    return this.apiService.get(`${this.baseUrl}/account/json`);
  }

  /***
    Stream of most recent actions where obj is the actor OR target OR action_object.
  ***/
  public objectAny(contentType, target) {
    return this.apiService.get(`${this.baseUrl}/${contentType}/${target}/json`);
  }
}
