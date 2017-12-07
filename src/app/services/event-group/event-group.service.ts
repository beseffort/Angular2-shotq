import moment from 'moment';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { EventGroup } from '../../models/event-group';
import { EventGroupWeather } from '../../models/event-group-weather.model';

@Injectable()
export class EventGroupService extends RestClientService<EventGroup> {
  baseUrl = 'event/eventgroup';

  weather(eventGroupId: number, date: moment.Moment): Observable<EventGroupWeather> {
    return this.itemGet(eventGroupId, 'weather', {date: date.toISOString()});
  }
}
