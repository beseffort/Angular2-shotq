import * as _ from 'lodash';
import moment from 'moment';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Job } from '../../../../models/job';
import { BaseEvent, Event } from '../../../../models/event';
import { EventGroup } from '../../../../models/event-group';
import { EventType } from '../../../../models/event-type';
import { JobService } from '../../../../services/job';
import { EventGroupService } from '../../../../services/event-group';
import { EventService } from '../../../../services/event';
import { EventTypeService } from '../../../../services/event-type';
import { AlertifyService } from '../../../../services/alertify/alertify.service';

@Component({
  selector: 'job-events-editor',
  templateUrl: './job-events-editor.component.html'
})
export class JobEventsEditorComponent implements OnInit {
  @Input() job: Job;
  @Output() mainEventChanged = new EventEmitter<BaseEvent>();
  confirmMsg: string = 'Are you sure that you want to do this?';
  currentGroup: EventGroup;
  eventTypes: EventType[];

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private alertify: AlertifyService,
    private jobService: JobService,
    private eventGroupService: EventGroupService,
    private eventService: EventService,
    private eventTypeService: EventTypeService
  ) { }

  ngOnInit() {
    this.setInitialEventGroup();
    this.loadEventTypes();
  }

  editGroup(group: EventGroup) {
    if (this.currentGroup) {
      this.closeGroupForm();
    }
    setTimeout(() => {
      this.currentGroup = group;
    }, 0);
  }

  closeGroupForm() {
    this.currentGroup = null;
  }

  addNewGroup(index: number) {
    let data = {
      name: 'Event group',
      job: this.job.id
    };
    this.eventGroupService.create(data).subscribe((group) => {
      this.job.eventgroups.splice(index, 0, group);
      this.sortGroups();
      this.editGroup(group);
    });
  }

  saveGroup(group: EventGroup) {
    this.eventGroupService.save(group).subscribe((groupData) => {
      let index = this.job.eventgroups.findIndex(g => g.id === groupData.id);
      if (index !== -1) {
        this.job.eventgroups[index] = groupData;
        this.sortGroups();
      }
      this.currentGroup = groupData;
      if (this.job.main_event_group && this.job.main_event_group.id === groupData.id) {
        _.assign(this.job.main_event_group, groupData);
        this.job.main_event_date = this.job.main_event_group.start;
      }
    });
  }

  deleteGroup(group: EventGroup) {
    this.alertify.confirm(this.confirmMsg, () => {
      this.eventGroupService.delete(group.id).subscribe(() => {
        this.currentGroup = null;
        let index = this.job.eventgroups.findIndex(g => g.id === group.id);
        let isMainEvent = this.job.main_event_group &&
          this.job.main_event_group.id === this.job.eventgroups[index].id;
        this.job.eventgroups.splice(index, 1);
        // if the main event is deleted emit the mainEventChanged with the empty Event
        if (isMainEvent)
          this.mainEventChanged.emit(Event.Empty);
      });
    });
  }

  addNewEventItem(index: number) {
    let groupIndex = this.getCurrentGroupIndex();
    let newEventItem = EventService.newObject({
      name: 'New event',
      event_group: this.currentGroup.id,
      account: this.currentGroup.account
    });
    this.job.eventgroups[groupIndex].events.splice(index, 0, newEventItem);
  }

  saveEventItem(data: {index: number, event: Event}) {
    this.eventService.save(data.event).subscribe((event) => {
      let groupIndex = this.getCurrentGroupIndex();
      this.job.eventgroups[groupIndex].events[data.index] = event;
    });
  }

  deleteEventItem(index: number) {
    let groupIndex = this.getCurrentGroupIndex();
    let eventId = this.job.eventgroups[groupIndex].events[index].id;
    if (eventId) {
      this.alertify.confirm(this.confirmMsg, () => {
        this.eventService.delete(eventId).subscribe(() => {
          this.job.eventgroups[groupIndex].events.splice(index, 1);
        });
      });
    } else {
      this.job.eventgroups[groupIndex].events.splice(index, 1);
    }
  }

  setMainEventGroup(group: EventGroup) {
    this.alertify.confirm(this.confirmMsg, () => {
      let data = {main_event_group: group};
      this.jobService.partialUpdate(this.job.id, data).subscribe((job) => {
        _.assign(this.job, _.pick(job, 'main_event_group', 'main_event_date'));
        this.mainEventChanged.emit(EventService.newObject(job.main_event_group));
      });
    });
  }

  loadEventTypes() {
    this.eventTypeService.getList().subscribe((res) => {
      this.eventTypes = res.results;
    });
  }

  private getCurrentGroupIndex(): number {
    return this.job.eventgroups.findIndex(g => g.id === this.currentGroup.id);
  }

  private sortGroups() {
    let eventgroups = _.sortBy(this.job.eventgroups, g => g.start ? moment(g.start).unix() : 0);
    this.job.eventgroups = eventgroups;
  }

  private setInitialEventGroup() {
    if (this.route.snapshot.queryParams['eventgroup']) {
      this.currentGroup = _.find(
        this.job.eventgroups,
        {id: parseInt(this.route.snapshot.queryParams['eventgroup'], 10)});
      this.location.replaceState(`/jobs/${this.job.id}`);
      return;
    }
    if (this.job.main_event_group) {
      this.currentGroup = _.find(this.job.eventgroups, {id: this.job.main_event_group.id});
    }
  }
}
