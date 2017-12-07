import moment from 'moment';
import * as _ from 'lodash';
import { EventGroup } from '../../../models/event-group';
import { EventGroupService } from '../../../services/event-group';
import { DayPeriod } from './day-period.model';
import { getWeatherIconClassByCode } from './openweathermap-icons';

export class ScheduleEvent {
  event: EventGroup;
  dayPeriod: DayPeriod;
  periodStr: string = '';
  needFetchWeather: boolean;
  weatherIcon: string = 'wi wi-na';
  weatherDate: moment.Moment;

  constructor(event: EventGroup, dayPeriod?: DayPeriod) {
    this.event = event;
    if (this.event.start && this.event.end) {
      let startDt = moment(this.event.start);
      let endDt = moment(this.event.end);
      if (endDt.diff(startDt, 'days', true) > 1) {
        this.periodStr = 'Multiple days event';
      } else {
        this.periodStr = `${startDt.format('LT')} - ${endDt.format('LT')}`;
      }
    }
    this.dayPeriod = dayPeriod;
    this.fillNeedFetchWeather(this.dayPeriod);
  }

  fillWeatherIcon(service: EventGroupService) {
    let date = this.dayPeriod.start.clone().add(12, 'hours');
    service.weather(this.event.id, date).subscribe((weather) => {
      this.weatherIcon = getWeatherIconClassByCode(weather.weather_code);
    });
  }

  private fillNeedFetchWeather(dayPeriod: DayPeriod) {
    let currentDt = moment();
    let weekAhead = currentDt.clone().add(1, 'week');
    let allDataAvailable = !!this.event.start && !!_.get(this.event, 'location.city');
    this.needFetchWeather = allDataAvailable && dayPeriod && dayPeriod.start.isBetween(currentDt, weekAhead);
  }
}
