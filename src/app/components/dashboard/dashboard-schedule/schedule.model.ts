import moment from 'moment';
import { RRule } from 'rrule';
import { EventGroup } from '../../../models/event-group';
import { ScheduleEvent } from './schedule-event.model';
import { DayPeriod } from './day-period.model';

export interface ScheduleDay {
  events: ScheduleEvent[];
  period: DayPeriod;
  dayTitle: string;
  isPassed: boolean;
}

export class DashboardSchedule {
  events: EventGroup[];
  days: ScheduleDay[];
  from_date: moment.Moment;
  to_date: moment.Moment;

  constructor(events: EventGroup[], from_date: moment.Moment, to_date: moment.Moment) {
    this.events = events;
    this.from_date = from_date;
    this.to_date = to_date;
    this.generateDays();
  }

  private generateDays() {
    let dates = new RRule({
      freq: RRule.DAILY,
      dtstart: this.from_date.toDate(),
      until: this.to_date.toDate()
    }).all().map((val, index): DayPeriod => {
      let startDate = moment(val);
      let endDate = startDate.clone().endOf('date');
      return {start: startDate, end: endDate};
    });
    let currentDate = moment();
    this.days = dates.map((period) => {
      let events = this.events.filter((e) => {
        let startIn = e.start && moment(e.start).isBetween(period.start, period.end);
        let endIn = e.end && moment(e.end).isBetween(period.start, period.end);
        return startIn || endIn;
      }).map(e => new ScheduleEvent(e, period));
      return {
        events: events,
        period: period,
        dayTitle: period.start.format('dddd L'),
        isPassed: currentDate.isAfter(period.end)
      };
    });
  }
}
