import moment from 'moment';
import { Component, OnInit } from '@angular/core';

import { EventGroup } from '../../../models/event-group';
import { EventGroupService } from '../../../services/event-group';
import { EventGroupFilterParams, EventGroupFilter } from './group-event-filter.model';
import { DashboardSchedule } from './schedule.model';

@Component({
  selector: 'dashboard-schedule',
  templateUrl: './dashboard-schedule.component.html',
  styleUrls: ['./dashboard-schedule.component.scss']
})
export class DashboardScheduleComponent implements OnInit {
  groupEventFilter: EventGroupFilter = new EventGroupFilter();
  eventGroups: EventGroup[];
  schedule: DashboardSchedule;
  isLoading: boolean = false;

  constructor(private eventGroupService: EventGroupService) { }

  ngOnInit() {
    this.updateEventGroupFilter({
      from_date: moment().startOf('week'),
      to_date: moment().endOf('week')
    });
  }

  changeWeek(weeksNumber: number) {
    this.updateEventGroupFilter({
      from_date: this.groupEventFilter.params.from_date.add(weeksNumber, 'weeks'),
      to_date: this.groupEventFilter.params.to_date.add(weeksNumber, 'weeks'),
    });
  }

  private updateEventGroupFilter(changes: EventGroupFilterParams) {
    this.groupEventFilter.updateFilterParams(changes);
    this.loadGroupEvents();
  }

  private loadGroupEvents() {
    this.isLoading = true;
    let params = this.groupEventFilter.toQueryParams();
    this.eventGroupService.getList(params).subscribe(
      this.extractEvents.bind(this),
      () => {},
      () => { this.isLoading = false; }
    );
  }

  private extractEvents(res) {
    this.eventGroups = res.results;
    this.generateSchedule();
  }

  private generateSchedule() {
    this.schedule = new DashboardSchedule(
      this.eventGroups,
      this.groupEventFilter.params.from_date,
      this.groupEventFilter.params.to_date);
    this.fillWeatherIcons();
  }

  private fillWeatherIcons() {
    this.schedule.days.forEach((day) => {
      day.events.forEach((scheduleEvent) => {
        if (scheduleEvent.needFetchWeather) {
          scheduleEvent.fillWeatherIcon(this.eventGroupService);
        }
      });
    });
  }

}
