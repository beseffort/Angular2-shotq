import {
  Component, EventEmitter, Input, OnInit, Output,
  ViewChild, SimpleChanges, OnDestroy
} from '@angular/core';
import { CalendarComponent } from 'ap-angular2-fullcalendar';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import moment from 'moment';
import 'moment-timezone';

@Component({
  selector: 'calendar-fullcalendar',
  templateUrl: './calendar-fullcalendar.component.html',
  styleUrls: ['./calendar-fullcalendar.component.scss'],
})
export class CalendarFullcalendarComponent implements OnInit, OnDestroy {
  @ViewChild(CalendarComponent) fc: CalendarComponent;
  @Output() onInit: EventEmitter<any> = new EventEmitter<any>();
  @Input() events: any[];

  calendarOptions: Object;

  constructor(
    private router: Router,
  ) {}

  ngOnInit() {
    this.calendarOptions = {
      fixedWeekCount : false,
      editable: false,
      eventLimit: false,
      allDaySlot: false,
      height: 'auto',
      views: {
        week: {
          titleFormat: 'MMM D',
          columnFormat: 'dddd M/D',
          slotLabelFormat: 'h A'
        }
      },
      timezone: false,
      defaultView: 'agendaWeek',
      header: {left: '', center: '', right: ''},
      events: [],
      eventTextColor: '#4D5366',
      eventColor: '#B5C1CE',
      eventClick: _.bind(this.goToJob, this),
      eventMouseover: _.bind(this.addPopover, this),
      eventMouseout: _.bind(this.removePopover, this),
      eventRender: (event, element) => {
        if (this.isShortEvent(event))
          element.addClass('short');
        // Add a tally to the first rendered event instance.
        element.renderCounter = event.renderCounter = (event.renderCounter || 0) + 1;
        if (event.renderCounter === 1) {
          let tally = $(`<div class="tally"></div>`);
          tally.css({'background-color': event.color || '#B5C1CE'});
          element.prepend(tally);
        }
        return element;
      }
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.events)
      this.setEvents(changes.events.currentValue);
  }

  ngOnDestroy() {
    this.removeAllPopovers();
  }

  getFcSeg(jsEvent) {
    for (let property of _.keys(jsEvent.currentTarget)) {
      if (property.startsWith('jQuery') && jsEvent.currentTarget[property]['fcSeg'] ) {
        return jsEvent.currentTarget[property]['fcSeg'];
      }
    }
  }

  addPopover(event, jsEvent, view) {
    // Add the event group's popover
    let popover = event.popoverElement = $(this.getPopoverHtml(event, jsEvent));
    popover.hover(
      () => this.cancelPopoverRemoving(popover),
      () => this.removePopover(event)
    );
    let viewEventGroupButton = event.popoverElement.find('.sq-btn-submit');
    viewEventGroupButton.click(_.bind(this.goToJob, this, event));

    // Calc the event group's popover position
    let eventElement = $(jsEvent.currentTarget);
    let eventOffset = eventElement.offset();
    eventOffset.left -= 320 + 20; // popover width + triangle offset
    if (this.isShortEvent(event)) {
      eventOffset.left -= 2;
      eventOffset.top -= 25;
    }
    event.popoverElement.offset(eventOffset);

    $('body').append(popover);
  }

  removeAllPopovers() {
    $('.fc-event-popover').remove();
  }

  removePopover(event) {
    // Remove the event group's popover
    let element = event.popoverElement;
    element['timeout'] = setTimeout(() => element.remove(), 100);
  }

  cancelPopoverRemoving(popover) {
    setTimeout(() => clearTimeout(popover['timeout']), 50);
  }

  addEvents(source) {
    this.fc.fullCalendar('addEventSource', source);
  }

  getEvents() {
    return this.fc.fullCalendar('clientEvents') || [];
  }

  removeEvents(optionalSourcesArray?) {
    this.fc.fullCalendar('removeEventSources', optionalSourcesArray);
  }

  setEvents(source) {
    this.removeEvents();
    this.addEvents(source);
  }

  changeView(view: string) {
    this.fc.fullCalendar('changeView', view);
  }

  next() {
    this.fc.fullCalendar('next');
  }

  prev() {
    this.fc.fullCalendar('prev');
  }

  getView(): any {
    return this.fc.fullCalendar('getView');
  }

  getTitle() {
    return this.getView()['title'];
  }

  getViewName() {
    return this.getView()['name'];
  }

  goToJob(event) {
    let params = {eventgroup: event.id};
    this.router.navigate(['/jobs', event.job], {queryParams: params});
  }

  isShortEvent(event) {
    let duration = moment.duration(event.end.diff(event.start));
    return duration.asMinutes() <= 15;
  }

  getPopoverHtml(eventGroup, jsEvent) {
    let eventsTemplate = ``;
    let eventGroupDescriptionTemplate = ``;
    let fcSeg = this.getFcSeg(jsEvent);
    let filteredEvents = _.filter(eventGroup.events, (e) => {
      let startOfDay = fcSeg.start.startOf('day');
      let endOfDay = fcSeg.end.endOf('day');
      return moment(e['start']).isBetween(startOfDay, endOfDay);
    });
    if (filteredEvents.length) {
      let renderedEvents = ``;
      for (let event of filteredEvents) {
        renderedEvents += `
          <li class="fc-event-popover__sub-event">
            <a href="" class="fc-event-popover__event-item">
              <div class="fc-event-popover__event-name">${event['name']}</div>
              <div class="fc-event-popover__event-time">${event['start__formatted']} - ${event['end__formatted']}</div>
            </a>
          </li>`;
      }
      eventsTemplate = `<ul class="fc-event-popover__sub-events">${renderedEvents}</ul>`;
    }
    if (eventGroup.description) {
      eventGroupDescriptionTemplate = `<div class="fc-event-popover__desc" *ngIf="eventGroup.description">${eventGroup.description}</div>`;
    }
    return `
      <div class="fc-event-popover__wrapper">
        <div class="fc-event-popover">
          <div class="fc-event-popover__header">
            <h4 class="fc-event-popover__title" style="color: ${eventGroup.color}">
              <i class="fa fa-circle"></i>
              <span>${eventGroup.name}</span>
            </h4>
            <div class="fc-event-popover__location">${eventGroup.location ? eventGroup.location.address1 : ''}</div>
            ${eventsTemplate}
          </div>
          ${eventGroupDescriptionTemplate}
          <div class="fc-event-popover__footer">
            <div class="fc-event-popover__btn">
              <button class="sq-btn-submit">View</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  onCalendarInit() {
    this.onInit.emit();
  }
}
