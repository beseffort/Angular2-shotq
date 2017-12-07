import * as _ from 'lodash';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EventTypeService } from '../../../services/event-type/event-type.service';
import { SortPipe } from '../../../pipes/sort/sort.pipe';
import { EventType } from '../../../models/event-type';
import { CalendarFilterOptions } from './calendar-filter.constants';
import { JobWorkerService } from '../../../services/job-worker/job-worker.service';
import { JobWorker } from '../../../models/job-worker';
import * as choices from '../../+settings/account/account.constants';
import { AccessService } from '../../../services/access/access.service';


@Component({
  selector: 'calendar-filter',
  templateUrl: './calendar-filter.component.html',
  styleUrls: ['./calendar-filter.component.scss'],
  providers: [
    EventTypeService,
    JobWorkerService,
    SortPipe,
    AccessService,
  ]
})
export class CalendarFilterComponent implements OnInit {
  @Output() onFiltersChanged: EventEmitter<CalendarFilterOptions> = new EventEmitter<CalendarFilterOptions>();
  @Output() onTimezoneChanged: EventEmitter<any> = new EventEmitter<any>();
  choices = choices;
  isEventTypesLoading: Boolean = true;
  eventTypes: EventType[];
  jobWorkers: JobWorker[];
  timezone: string;
  defaultTZ: string = 'UTC';
  filterOptions: CalendarFilterOptions = {
    eventTypes: [],
    jobWorkers: [],
    unassigned: true,
    booked: true,
    lead: true
  };

  constructor(
    private eventTypeService: EventTypeService,
    private jobWorkerService: JobWorkerService,
    private sortPipe: SortPipe,
    private accessService: AccessService
  ) {}

  ngOnInit() {
    this.loadEventTypes();
    this.loadJobWorkers();
    this.accessService.getUserProfileInfo().subscribe(user => {
      this.defaultTZ = this.timezone = user.user_profile.timezone || 'UTC';
    });
  }

  loadEventTypes() {
    this.isEventTypesLoading = true;
    this.eventTypeService
      .getList()
      .finally(() => { this.isEventTypesLoading = false; })
      .subscribe(
        (result) => {
          this.eventTypes = this.sortPipe.transform(result.results, 'name');
          this.toggleFilterItems('eventTypes', true);
        },
      );
  }

  loadJobWorkers() {
    this.isEventTypesLoading = true;
    this.jobWorkerService
      .getList()
      .finally(() => { this.isEventTypesLoading = false; })
      .subscribe(
        (result) => {
          let uniqueByWorker = _.uniqBy(result.results, 'worker');
          this.jobWorkers = this.sortPipe.transform(uniqueByWorker, 'name');
          this.toggleFilterItems('jobWorkers', true);
        },
      );
  }

  filterIsNotInitialized(filterName: string) {
    return !this.filterOptions[filterName] || !this[filterName];
  }

  isItemsChecked(fName) {
    if (this.filterIsNotInitialized(fName))
      return false;
    if (fName === 'jobWorkers' && !this.filterOptions.unassigned)
      return false;
    return this.filterOptions[fName].length === this[fName].length;
  }

  toggleFilterItems(fName, force: boolean = false) {
    let isChecked = this.isItemsChecked(fName);
    if (this.filterIsNotInitialized(fName))
      return;
    if (force || !isChecked) {
      this.filterOptions[fName] = _.clone(this[fName]);
    } else {
      this.filterOptions[fName] = [];
    }
    if (fName === 'jobWorkers')
      this.filterOptions.unassigned = !isChecked;
    this.onFiltersChanged.emit(this.filterOptions);
  }

  isItemChecked(filterName: string, item: EventType | JobWorker | boolean, pk: string = 'id') {
    let fo = this.filterOptions[filterName];
    if (_.isArray(fo)) {
      let ids = _.map(this.filterOptions[filterName], pk);
      return ids.indexOf(item[pk]) > -1;
    } else {
      return fo === item;
    }
  }

  toggleFilterItem(filterName: string, item: EventType | JobWorker | boolean, pk: string = 'id') {
    let fo = this.filterOptions[filterName];
    if (_.isArray(fo)) {
      let isChecked = this.isItemChecked(filterName, item);
      isChecked ? _.remove(fo, _item => _item[pk] === item[pk]) : fo.push(item);
    } else {
      this.filterOptions[filterName] = !fo;
    }
    this.onFiltersChanged.emit(this.filterOptions);
  }

  timezoneChanged(timezone) {
    this.onTimezoneChanged.emit(timezone || this.defaultTZ);
  }
}
