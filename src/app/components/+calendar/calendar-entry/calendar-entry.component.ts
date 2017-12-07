import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarHeaderComponent } from '../calendar-header/calendar-header.component';
import { CalendarFilterComponent } from '../calendar-filter/calendar-filter.component';
import { CalendarFullcalendarComponent } from '../calendar-fullcalendar/calendar-fullcalendar.component';
import { EventGroup } from '../../../models/event-group';
import {
  EventGroupFilter,
  EventGroupFilterParams
} from '../../dashboard/dashboard-schedule/group-event-filter.model';
import { EventGroupService } from '../../../services/event-group/event-group.service';
import * as _ from 'lodash';
import { CalendarFilterOptions } from '../calendar-filter/calendar-filter.constants';
import moment from 'moment';
import 'moment-timezone';

@Component({
  selector: 'calendar-entry',
  templateUrl: './calendar-entry.component.html',
  styleUrls: ['./calendar-entry.component.scss'],
  providers: [
    CalendarHeaderComponent,
    CalendarFilterComponent,
    CalendarFullcalendarComponent,
    EventGroupService
  ]
})
export class CalendarEntryComponent implements OnInit {
  @ViewChild(CalendarFullcalendarComponent) calendar: CalendarFullcalendarComponent;
  eventGroupFilter: EventGroupFilter = new EventGroupFilter();
  eventGroups: EventGroup[];
  title: string;
  currentView: string;
  calendarFilterOptions: any = {};
  timezone: string;

  constructor(
    private eventGroupService: EventGroupService,
  ) {}

  ngOnInit() {}

  onCalendarInit() {
    this.title = this.calendar.getTitle();
    this.currentView = this.calendar.getViewName();
    this.updateEventGroupFilter({
      from_date: moment().startOf('week'),
      to_date: moment().endOf('week')
    });
  }

  formatEventDates(event, format: string = 'hh:mm A', prefix: string = '__formatted') {
    for (let attr of ['start', 'end']) {
      if (!event[attr] || !this.timezone)
        return;
      let dt = moment(event[attr]).tz(this.timezone);
      event[attr + prefix] = format ? dt.format(format) : dt.format();
    }
  }

  formatEventGroup(eventGroups) {
    let _eventGroups = _.clone(eventGroups);
    for (let eGroup of _eventGroups) {
      eGroup['renderCounter'] = 0;
      eGroup['color'] = eGroup.event_type_color;
      eGroup['title'] = eGroup.name;
      this.formatEventDates(eGroup, '', '');
      if (_.size(eGroup.events)) {
        eGroup.events.map((e) => this.formatEventDates(e));
      }
    }
    return _eventGroups;
  }

  timezoneChanged(timezone) {
    this.timezone = timezone;
    let clientEvents = this.calendar.getEvents();
    if (_.size(clientEvents)) {
      this.eventGroups = this.formatEventGroup(clientEvents);
    }
  }

  updateCalendarView(view) {
    this.currentView = view;
    this.calendar.changeView(view);
    this.title = this.calendar.getTitle();
  }

  applyFilters(filterOptions: CalendarFilterOptions) {
    let opts = _.pick(filterOptions, ['unassigned', 'lead', 'booked']);
    if (filterOptions.eventTypes)
      opts['event_type'] = _.join(_.map(filterOptions.eventTypes, 'id'), ',');
    if (filterOptions.jobWorkers)
      opts['job_workers'] = _.join(_.map(filterOptions.jobWorkers, 'worker'), ',');
    this.updateEventGroupFilter(opts);
  }

  next() {
    this.changeWeek(+1);
    this.calendar.next();
    this.title = this.calendar.getTitle();
  }

  prev() {
    this.changeWeek(-1);
    this.calendar.prev();
    this.title = this.calendar.getTitle();
  }

  private changeWeek(weeksNumber: number) {
    this.updateEventGroupFilter({
      from_date: this.eventGroupFilter.params.from_date.add(weeksNumber, 'weeks'),
      to_date: this.eventGroupFilter.params.to_date.add(weeksNumber, 'weeks'),
    });
  }

  private allFiltersSet(filters) {
    for (let fName of ['event_type', 'from_date', 'to_date']) {
      if (!filters[fName])
        return false;
    }
    if (!filters['job_workers'] && !filters['unassigned'])
      return false;
    return filters['booked'] || filters['lead'];
  }

  private updateEventGroupFilter(changes: EventGroupFilterParams) {
    _.assign(this.calendarFilterOptions, changes);
    if (this.allFiltersSet(this.calendarFilterOptions)) {
      this.eventGroupFilter.updateFilterParams(this.calendarFilterOptions);
      this.loadEventGroups();
    } else {
      this.calendar.removeEvents();
    }
  }

  private loadEventGroups() {
    let params = this.eventGroupFilter.toQueryParams();
    this.eventGroupService.getList(params).subscribe(
      this.extractEvents.bind(this),
      () => {},
      () => {}
    );
  }

  private extractEvents(res) {
    this.eventGroups = this.formatEventGroup(res.results);
  }
}
