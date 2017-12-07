import * as _ from 'lodash';
import moment from 'moment';
import { SetOptions } from 'eonasdan-bootstrap-datetimepicker';
import {
  Component, Input, Output,
  EventEmitter, OnChanges, SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FlashMessageService } from '../../../../../services/flash-message/flash-message.service';
import { EventGroup } from '../../../../../models/event-group';
import { Event } from '../../../../../models/event';
import { datesIntervalValidator } from '../../../../../validators';
import { UpdateLocationEvent } from './event-location';

@Component({
  selector: 'group-events',
  templateUrl: './group-events.component.html',
  styleUrls: ['./group-events.component.scss']
})
export class GroupEventsComponent implements OnChanges {
  currentEventItemIndex: number;
  eventItemForm: FormGroup;
  options: SetOptions;
  @Input() eventGroup: EventGroup;
  @Output() saveEvent: EventEmitter<{index: number, event: Event}> = new EventEmitter<{index: number, event: Event}>();
  @Output() addNewEvent: EventEmitter<number> = new EventEmitter<number>();
  @Output() deleteEvent: EventEmitter<number> = new EventEmitter<number>();
  private timeFormat: string = 'short';

  constructor(
    private fb: FormBuilder,
    public flash: FlashMessageService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['eventGroup']) {
      this.updateTimeFormats();
    }
  }

  selectEventItem(index: number) {
    if (index === this.currentEventItemIndex) {
      return;
    }
    this.currentEventItemIndex = index;
    this.updateDatetimepickerOptions();
    this.setupEventItemForm();
  }

  closeEventItem() {
    this.currentEventItemIndex = null;
    this.eventItemForm = null;
  }

  setupEventItemForm() {
    let eventItem = this.eventGroup.events[this.currentEventItemIndex];
    this.eventItemForm = this.fb.group({
      name: [eventItem.name, Validators.required],
      start: [eventItem.start, Validators.required],
      end: [eventItem.end, Validators.required]
    }, {validator: datesIntervalValidator('start', 'end')});
    if (this.options.minDate && !eventItem.start) {
      this.eventItemForm.patchValue({start: this.options.minDate});
    }
    if (this.options.maxDate && !eventItem.end) {
      this.eventItemForm.patchValue({end: this.options.maxDate});
    }
  }

  addEventItem(index: number) {
    this.addNewEvent.emit(index);
    setTimeout(() => {
      let interval = this.getStartEnd(index);
      if (interval.end.diff(interval.start, 'minutes') >= 15) {
        this.selectEventItem(index);
        this.saveEventItem();
      } else {
        this.deleteEventItem(index);
        this.flash.error('Not enough time period to create an event');
      }
    });
  }

  saveEventItem() {
    if (this.eventItemForm.invalid) {
      return;
    }
    let oldEvent = this.eventGroup.events[this.currentEventItemIndex];
    let startDt = oldEvent.start;
    let endDt = oldEvent.end;
    if (!startDt && !endDt) {
      startDt = this.eventGroup.start;
      endDt = this.eventGroup.end;
    }
    let event: Event = Object.assign(
      {event_group: this.eventGroup.id},
      oldEvent,
      this.eventItemForm.value,
    );
    this.saveEvent.emit({
      index: this.currentEventItemIndex,
      event: event
    });
    this.closeEventItem();
  }

  deleteEventItem(index: number) {
    this.closeEventItem();
    this.deleteEvent.emit(index);
  }

  updateEventItemLocation(data: UpdateLocationEvent) {
    let event = Object.assign({}, data.eventItem, {location: data.location});
    let index = this.eventGroup.events.findIndex(e => e.id === data.eventItem.id);
    this.saveEvent.emit({
      index: index,
      event: event
    });
  }

  identify(index: number, item: Event): number {
    return item.id;
  }

  private getStartEnd(index: number): {start: moment.Moment, end: moment.Moment} {
    let start, end;
    if (this.eventGroup.events.length < 2) {
      start = this.eventGroup.start;
      end = this.eventGroup.end;
    } else {
      if (index === 0) {
        start = this.eventGroup.start;
      } else {
        start = this.eventGroup.events[index - 1].end;
      }
      if (index === this.eventGroup.events.length - 1) {
        end = this.eventGroup.end;
      } else {
        end = this.eventGroup.events[index + 1].start;
      }
    }
    let startDt = moment(start);
    if (!startDt.isValid()) {
      startDt = moment().add(1, 'h').startOf('hour');
    }
    let endDt = moment(end);
    if (!endDt.isValid()) {
      endDt = moment().add(3, 'months').startOf('month');
    }
    if (startDt.isAfter(endDt)) {
      return {start: endDt, end: startDt};
    }
    return {start: startDt, end: endDt};
  }

  private updateTimeFormats() {
    if (this.eventGroup.start && this.eventGroup.end) {
      let startDt = moment(this.eventGroup.start);
      let endDt = moment(this.eventGroup.end);
      let diffInHours = endDt.diff(startDt, 'hours', true);
      if (diffInHours >= 24) {
        this.timeFormat = 'short';
      } else {
        this.timeFormat = 'shortTime';
      }
    }
  }

  private updateDatetimepickerOptions() {
    let intervalDate = this.getStartEnd(this.currentEventItemIndex);
    let diffInHours = intervalDate.end.diff(intervalDate.start, 'hours');
    let dtPickerFormat = diffInHours > 23 ? 'L LT' : 'LT';
    this.options = {
      useCurrent: false,
      format: dtPickerFormat,
      minDate: intervalDate.start,
      maxDate: intervalDate.end
    };
  }

}
