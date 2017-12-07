import { Injectable } from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { Event } from '../../models/event';

@Injectable()
export class EventService extends RestClientService<Event> {
  baseUrl = 'event/event';

  public static newObject(data?: object): Event {
    return Object.assign(new Event(), data || {});
  }
}
