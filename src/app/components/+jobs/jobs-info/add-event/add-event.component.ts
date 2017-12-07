import {
 Component,
 ViewEncapsulation,
 Input,
 Output,
 EventEmitter,
 DoCheck,
 OnInit,
 ViewChildren,
 QueryList,
 AfterViewInit,
 ChangeDetectorRef,
 OnDestroy
}                                     from '@angular/core';
import { Router, ActivatedRoute }     from '@angular/router';
import { DatePipe }                   from '@angular/common';
/* Services */
import { EventService }               from '../../../../services/event';
import { EventGroupService }          from '../../../../services/event-group';
import { EventTypeService }           from '../../../../services/event-type';
import { ModalService }               from '../../../../services/modal/';
import { FlashMessageService }        from '../../../../services/flash-message';
import { JobService }                 from '../../../../services/job/';
import { GeneralFunctionsService }    from '../../../../services/general-functions';
import { ApiService }                 from '../../../../services/api/';
/* Modules */
/* Components */
import { FormFieldAddressComponent }  from '../../../shared/form-field-address/form-field-address.component';
import { TimepickerComponent }        from '../../../shared/timepicker/timepicker.component';
/* Models */
import { Address }                    from '../../../../models/address';
import { Job }                        from '../../../../models/job';
import { Event }                      from '../../../../models/event';
import { EventGroup }                 from '../../../../models/event-group';
import { EventType }                  from '../../../../models/event-type';

declare let require: (any);

@Component({
  selector: 'add-event',
  templateUrl: 'add-event.component.html',
  styleUrls: ['add-event.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [EventService, JobService, EventTypeService, EventGroupService, GeneralFunctionsService, ApiService, DatePipe]
})
export class AddEventComponent {
  @Input() jobData =                new Job();
  @Output() closeModal =            new EventEmitter();
  @ViewChildren(FormFieldAddressComponent) formAddresses: QueryList<FormFieldAddressComponent>;
  @ViewChildren(TimepickerComponent) timepickers: QueryList<TimepickerComponent>;
  public  _ =                       require('../../../../../../node_modules/lodash');
  private alertify =                require('../../../../assets/theme/assets/vendor/alertify-js/alertify.js');
  private router:                   Router;
  private componentRef:             any;
  private eventDate:                Date;
  private eventAddress =            new Address();
  private eventGroups:              Array<any> = []; // Events
  private events:                   Array<any> = []; // Appointments
  private eventTypes:               Array<EventType>;
  private auxStartDate:             Array<Date> = [];
  private auxEndDate:               Array<Date> = [];
  private auxStartTime:             Array<any> = [];
  private auxEndTime:               Array<any> = [];
  private isOpenEvGroup:            Array<any> = [];
  private isLoading:                boolean = false;
  private isSaving:                 boolean = false;
  private starttime:                any;
  private endtime:                  any;
  private starttimeMeridian:        any;
  private endtimeMeridian:          any;
  private jobId:                    number;
  private currentOpenedEventGrp:    any;
  private editOnEvGroupCreate:      Array<boolean> = [];
  private isLoadingHeader:          boolean = false;
  private isLoadingEventName:       boolean = false;
  private mainEventLvl1:            number = null;
  private mainEventLvl2:            number = null;
  private interval:                 any;
  private myDatePickerOptions = {
    dateFormat: 'mmm dd, yyyy',
    showTodayBtn: false,
    showSelectorArrow: false,
    showClearDateBtn: false
  };
  private actions = {
    trashIco: {
      message: 'Are you sure that you want to do this?',
    }
  };

  /**
   * Set parent component ref
   * @param {[type]} ref [reference od parent component object]
   */
  public setComponentRef(ref) {
    this.componentRef = ref;
  }

  constructor(
    private jobService:             JobService,
    private eventService:           EventService,
    private eventGroupService:      EventGroupService,
    private eventTypeService:       EventTypeService,
    private modalService:           ModalService,
    private flash:                  FlashMessageService,
    private generalFunctions:       GeneralFunctionsService,
    private apiService:             ApiService,
    private datePipe:               DatePipe,
    private ref:                    ChangeDetectorRef,
    _router:                        Router
  ) {
    this.router = _router;
    this.ref.detach();
    this.interval = setInterval(() => {
      this.ref.detectChanges();
    }, 500);
  }

  ngOnInit() {
    this.isLoading = true;
    this.jobId = this.jobData.id;
    // Set alertify settings.
    this.alertify.theme('bootstrap-shootq');
    this.alertify.okBtn('OK');
    this.getEventTypes();
    // Get job information (EventGroups and Events(Appointments)
    this.jobService.get(this.jobId)
      .subscribe(
        jobData => {
          this.jobData = jobData;
          // Get event types.
          if (jobData && jobData.eventgroups.length) {
            this.eventGroups = jobData.eventgroups;
            let evGroupLength = this.eventGroups.length;
            for (let i: number = 0;  i < evGroupLength; i++) {
              // Set array of flags for arrow in accordion level 1
              this.editOnEvGroupCreate.push(false);
              this.events[i] = jobData.eventgroups[i].events;
              this.eventGroups[i].isOpenEvGroup = false;
            }
            // set aux dates to don't change the panel-header dates
            for (let i: number = 0;  i < this.events.length; i++) {
              for (let j: number = 0;  j < this.events[i].length; j++) {
                let start = new Date(this.events[i][j].start);
                let end = new Date(this.events[i][j].end);
                this.events[i][j].fixedStartFullDate = this._.cloneDeep(this.events[i][j].start);
                this.events[i][j].fixedEndFullDate = this._.cloneDeep(this.events[i][j].end);
                this.events[i][j].fullDate = this.getAppointmentDate(this.events[i][j]);
                this.events[i][j].auxStartTime = this.extractHourFromDate(start);
                this.events[i][j].auxEndTime = this.extractHourFromDate(end);
                this.events[i][j].auxStartDate = {
                  date: {
                        year: start.getFullYear(),
                        month: start.getMonth() + 1,
                        day: start.getDate()
                    },
                  jsdate: start
                };
                this.events[i][j].auxEndDate = {
                  date: {
                        year: end.getFullYear(),
                        month: end.getMonth() + 1,
                        day: end.getDate()
                    },
                  jsdate: end
                };
                this.events[i][j].isOpen = false;
                this.events[i][j].isMainEvent = false;
                // Set array of flags for arrow in accordion level 2
                if (jobData.main_event && this.events[i][j].id === jobData.main_event) {
                  this.events[i][j].isOpen = true;
                  this.events[i][j].isMainEvent = true;
                  this.mainEventLvl1 = i;
                  this.mainEventLvl2 = j;
                  // this.events[i] is equal to eventgroups[i]
                  this.iterateOpenAccordion(i, 1);
                }
              }
            }
          }
        },
        err => {
          console.error(err);
        },
        () => {
          this.isLoading = false;
        }
      );
  }
  /**
   * Close modal without saving modifications
   *
   */
  public cancel() {
    this.closeModal.emit({action: 'close-modal'});
    clearInterval(this.interval);
  }
  /**
   * Set variables to save Location Name and
   *
   */
  public setErrorVariables() {
    for (let i: number = 0;  i < this.events.length; i++) {
      for (let j: number = 0;  j < this.events[i].length; j++) {
        this.events[i][j].nameError = false;
        this.events[i][j].locationNameError = false;
        this.events[i][j].startDateError = {
          error: false,
          message: ''
        };
        this.events[i][j].endDateError = {
          error: false,
          message: ''
        };
        this.events[i][j].timeError = false;
      }
    }
  }
  /**
   * Sort events by start date
   *
   */
  public sortByStartDate() {
    return this._.sortBy(this.events, [function(event) { return event.start; }]);
  }
  /**
   * Toggle event time visibility
   * @param {Event} ev [event to toggle time visibility]
   */
  public checkOption(ev: any, field: string) {
    ev[field] = !ev[field];
    if (field === 'all_day') {
      // remove date/time errors if 'all day' check-box is toggled
      for (let i: number = 0;  i < this.events.length; i++) {
        for (let j: number = 0;  j < this.events[i].length; j++) {
          this.events[i][j].startDateError = {
            error: false,
            message: ''
          };
          this.events[i][j].endDateError = {
            error: false,
            message: ''
          };
          this.events[i][j].timeError = false;
        }
      }
    }
  }
  /**
   * Set the selected event as Main Event
   *
   */
  public setMainEvent(ev_i: any, ev_j: any) {
    for (let i = 0; i < this.events.length; i++) {
      for (let j = 0; j < this.events[i].length; j++) {
        if (ev_i === i && ev_j === j) {
          this.events[i][j].isMainEvent = !this.events[i][j].isMainEvent;
          if (this.events[i][j].isMainEvent) {
            this.mainEventLvl1 = i;
            this.mainEventLvl2 = j;
          } else {
            this.mainEventLvl1 = null;
            this.mainEventLvl2 = null;
          }
        } else {
          this.events[i][j].isMainEvent = false;
        }
      }
    }
  }
  /**
   * Function triggered when delete event icon is pressed
   * @param {Event} ev [event to delete]
   */
  public onDeleteEvent(ev: Event, i: any, j?: any) {
    this.alertify.confirm(this.actions.trashIco.message, () => {
      if (ev.id && ev.id !== undefined) {
        this.eventService.delete(ev.id)
          .subscribe(response => {
            this.events[i].splice(j, 1);
            this.componentRef.ngOnInit();
          },
          err => {
            console.error(err);
          },
          () => {
          }
        );
      } else { // If there's no id (is not in API) remove from array only.
        this.events[i].splice(j, 1);
      }
    });
  }

  public onDeleteEventGroup(ev: Event, i: any) {
    this.alertify.confirm(this.actions.trashIco.message, () => {
      if (ev.id && ev.id !== undefined) {
        this.eventGroupService.delete(ev.id)
          .subscribe(response => {
            this.eventGroups.splice(i, 1);
            this.componentRef.ngOnInit();
          },
          err => {
            console.error(err);
          },
          () => {
          }
        );
      } else { // If there's no id (is not in API) remove from array only.
        this.events.splice(i, 1);
      }
    });
  }
  /**
   * [addNewEvent description]
   */
  public addNewEvent() {
    let date = new Date();
    let newEvent: any = new Object();
    let user = this.apiService.getAccount();
    newEvent.name = 'Untitled';
    newEvent.account = user; // Get proper account, remove hardcoded.
    newEvent.location = {'name': '', 'account': user};
    newEvent.nameError = false;
    newEvent.locationNameError = false;
    newEvent.startDateError = {
       error: false,
       message: ''
    };
    newEvent.endDateError = {
      error: false,
      message: ''
    };
    if (this.eventGroups[this.currentOpenedEventGrp].id) {
      newEvent.event_group = this.eventGroups[this.currentOpenedEventGrp].id;
    }
    newEvent.start = date;
    newEvent.end = date;
    newEvent.fixedStartFullDate = null;
    newEvent.fixedEndFullDate = null;
    newEvent.fullDate = this.getAppointmentDate(newEvent);
    newEvent.auxStartDate = date;
    newEvent.auxEndDate = date;
    newEvent.auxStartTime = this.extractHourFromDate(date);
    newEvent.auxEndTime = this.extractHourFromDate(date);
    newEvent.isOpen = false;
    if (this.eventTypes.length > 0) {
      newEvent.event_type = this.eventTypes[0].id;
    }
    this.events[this.currentOpenedEventGrp].push(newEvent);
    this.iterateOpenAccordion(this.events[this.currentOpenedEventGrp].length - 1, 2);
  }
  /**
   * [addNewEventGroup description]
   */
  public addNewEventGroup() {
    let user = this.apiService.getAccount();
    let newEventGroup: any = new Object();
    newEventGroup.name = 'Untitled';
    newEventGroup.account = user;
    newEventGroup.job = this.jobId;
    this.eventGroups.push(newEventGroup);
    this.events.push([]);
    this.iterateOpenAccordion(this.eventGroups.length - 1, 1);
    this.currentOpenedEventGrp = this.eventGroups.length - 1;
    this.addNewEvent();
    this.eventGroups[this.eventGroups.length - 1].events = this.events[this.currentOpenedEventGrp];
    this.editOnEvGroupCreate.push(true);
  }

  /**
   * Save changes
   */
  public save(closeModal?: boolean) {
    this.ref.detectChanges();
    if (this.getErrors()) {
      return;
    }
    this.isLoading = true;
    // check if the job has a new eventGroup, then create it
    for (let i = 0; i < this.eventGroups.length; i++) {
      if (!this.eventGroups[i].id) {
        this.eventGroupService.create(this.eventGroups[i])
          .subscribe(data => {
              this.eventGroups[i] = data;
              this.flash.success(`Event ${this.eventGroups[i].name} was created successfully.`);
            },
            err => {
              this.flash.error(`There was an error saving the Event ${this.eventGroups[i].name}, please try again later.`);
            },
            () => {
              if (i === this.eventGroups.length - 1) {
                if (this.eventGroups[i] && this.eventGroups[i].id) {
                  this.updateMainEventOnDb();
                }
                this.componentRef.ngOnInit();
                this.cancel();
                this.isLoading = false;
                this.modalService.data = {
                  eventChanged: true
                };
              }
            }
          );
      } else {
        let count = 0;
        for (let j = 0; j < this.eventGroups[i].events.length; j++) {
          // check new or edited event
          if (this.eventGroups[i].events[j].id) {
            // updated event
            this.eventService.update(this.eventGroups[i].events[j].id, this.eventGroups[i].events[j])
              .subscribe(data => {
                if (j === this.eventGroups[i].events.length - 1) {
                  this.flash.success(`Event ${this.eventGroups[i].name} was updated successfully.`);
                  this.updateMainEventOnDb();
                  this.componentRef.ngOnInit();
                  this.cancel();
                  this.isLoading = false;
                  this.modalService.data = {
                    eventChanged: true
                  };
                }
              },
              err => {
                console.error(err);
                this.flash.error(`There was an error updating the appointment ${this.eventGroups[i].events[j].name}, please try again later.`);
                if (j === this.eventGroups[i].events.length - 1) {
                  this.updateMainEventOnDb();
                  this.componentRef.ngOnInit();
                  this.cancel();
                  this.isLoading = false;
                  this.modalService.data = {
                    eventChanged: true
                  };
                }
              },
              () => {}
            );
          } else {
            // new event
            this.eventService.create(this.eventGroups[i].events[j])
              .subscribe(data => {
                this.eventGroups[i].events[j] = data;
                if (j === this.eventGroups[i].events.length - 1) {
                  this.flash.success(`Event ${this.eventGroups[i].name} was updated successfully.`);
                  this.updateMainEventOnDb();
                  this.componentRef.ngOnInit();
                  this.cancel();
                  this.isLoading = false;
                  this.modalService.data = {
                    eventChanged: true
                  };
                }
              },
              err => {
                console.error(err);
                this.flash.error(`There was an error creating the appointment ${this.eventGroups[i].events[j].name}, please try again later.`);
                if (j === this.eventGroups[i].events.length - 1) {
                  this.updateMainEventOnDb();
                  this.componentRef.ngOnInit();
                  this.cancel();
                  this.isLoading = false;
                  this.modalService.data = {
                    eventChanged: true
                  };
                }
              },
              () => {}
            );
          }
        }
      }
    }
  }
  /**
   * [updateMainEventOnDb description]
   */
  public updateMainEventOnDb() {
    // set main event if it has changed
    if (this.mainEventLvl1 !== null &&
      this.mainEventLvl2 !== null &&
      this.eventGroups[this.mainEventLvl1] &&
      this.eventGroups[this.mainEventLvl1].events[this.mainEventLvl2] &&
      this.eventGroups[this.mainEventLvl1].events[this.mainEventLvl2].id &&
      this.eventGroups[this.mainEventLvl1].events[this.mainEventLvl2].id !== this.jobData.main_event) {
      this.jobService.partialUpdate(this.jobId, {main_event: this.eventGroups[this.mainEventLvl1].events[this.mainEventLvl2].id})
        .subscribe(data => {
        },
        err => {
          console.error(err);
        });
    } else {
      if (this.mainEventLvl1 !== null &&
        this.mainEventLvl2 !== null &&
        this.eventGroups[this.mainEventLvl1].events[this.mainEventLvl2].id !== this.jobData.main_event) {
        console.error('There was an error setting the main event');
      }
    }
  }

  /**
   * Generic accordion boolean array iterator.
   *
   * @param {number} index   [description]
   * @param {string} varName [description]
   */
  public iterateOpenAccordion(index: number, lvl: number) {
    switch (lvl) {
      case 1:
        for (let i = 0; i < this.eventGroups.length; i++) {
          if (i === index) {
            this.eventGroups[i].isOpenEvGroup = true;
            this.currentOpenedEventGrp = index;
          } else {
            this.eventGroups[i].isOpenEvGroup = false;
          }
        }
        break;
      case 2:
        for (let i = 0; i < this.events.length; i++) {
          for (let j = 0; j < this.events[i].length; j++) {
            if (j === index) {
              this.events[i][j].isOpen = true;
            } else {
              this.events[i][j].isOpen = false;
            }
          }
        }
        break;
      default:
        break;
    }
  }
  /**
   * Function triggered when accordion group is closed
   * {number} lvl [1: EventGroup level | 2: Appointment level]
   */
  public iterateCloseAccordion(lvl: number) {
    switch (lvl) {
      case 1:
        // EventGroup
        for (let i = 0; i < this.eventGroups.length; i++) {
          this.eventGroups[i].isOpenEvGroup = false;
        }
        break;
      case 2:
        // Appointment
        for (let i = 0; i < this.events.length; i++) {
          for (let j = 0; j < this.events[i].length; j++) {
            this.events[i][j].isOpen = false;
          }
        }
        break;
      default:
        break;
    }
  }
  /**
   * Set Appointments DateTime for start and end and validates them
   */
  public checkEventsDateTime(i: number, j: number) {
    let errors = false;
    let startDate: Date = null;
    let endDate: Date = null;
    if (this.events[i][j].auxStartDate && this.events[i][j].auxStartDate.jsdate) {
      startDate = this._.cloneDeep(this.events[i][j].auxStartDate.jsdate);
    }
    if (this.events[i][j].auxEndDate && this.events[i][j].auxEndDate.jsdate) {
      endDate = this._.cloneDeep(this.events[i][j].auxEndDate.jsdate);
    }
    // check that start date is entered
    if (!startDate) {
      this.events[i][j].startDateError = {
        error: true,
        message: 'The above field is required. Please, enter Start Date.'
      };
      errors = true;
    }
    // check that end date is entered
    if (!endDate) {
      this.events[i][j].endDateError = {
        error: true,
        message: 'The above field is required. Please, enter End Date.'
      };
      errors = true;
    }
    // validate start and end date values
    if (startDate && endDate && startDate > endDate && !this.events[i][j].all_day) {
      this.events[i][j].startDateError = {
        error: true,
        message: 'Start date cannot be greater than end date.'
      };
      this.events[i][j].endDateError = {
        error: true,
        message: ''
      };
      this.events[i][j].timeError = true;
      errors = true;
    }
    if (!this.events[i][j].all_day) {
      let startHour = null;
      let endHour = null;
      // convert to 24h
      if (this.events[i][j].auxStartTime !== undefined && this.events[i][j].auxStartTime) {
        startHour = this.convert12hTo24h(this.events[i][j].auxStartTime);
      }
      if (this.events[i][j].auxEndTime !== undefined && this.events[i][j].auxEndTime) {
        endHour = this.convert12hTo24h(this.events[i][j].auxEndTime);
      }
      // validate start and end hours with the entered dates
      if (!startDate) {
        startDate = new Date();
      }
      if (!endDate) {
        endDate = new Date();
      }

      // set selected hour and minutes to start date
      startDate.setHours(parseInt(startHour[0] + startHour[1], 10));
      startDate.setMinutes(parseInt(startHour[3] + startHour[4], 10));
      // set selected hour and minutes to end date
      endDate.setHours(parseInt(endHour[0] + endHour[1], 10));
      endDate.setMinutes(parseInt(endHour[3] + endHour[4], 10));

      if (startDate > endDate && !(this.events[i][j].startDateError.error || this.events[i][j].endDateError.error)) {
        this.events[i][j].timeError = true;
        errors = true;
      }
    } else {
      // validate that all day events have same start and end date
      if (startDate && endDate) {
        startDate.setHours(0, 0, 0);
        endDate.setHours(0, 0, 0);
        if (startDate.getTime() !== endDate.getTime()) {
          this.events[i][j].startDateError = {
            error: true,
            message: 'All day event must have equal start and end dates.'
          };
          this.events[i][j].endDateError = {
            error: true,
            message: ''
          };
          errors = true;
        }
      }
    }

    // set start and end on ISO_8601 ("2017-01-27T17:45:30")
    let finalStart = null;
    let finalEnd = null;
    if (startDate) {
      finalStart = startDate.toISOString();
    }
    if (endDate) {
      finalEnd = endDate.toISOString();
    }

    if (!errors && finalStart && finalEnd) {
      this.events[i][j].start = finalStart;
      this.events[i][j].end = finalEnd;
    }
    return errors;
  }
  /**
   * Returns the hour from a Javascript Date, with format 02:45 PM
   */
  private extractHourFromDate(date: Date) {
    let hour = date.getHours();
    let finalHr = '';
    let finalMin = '';
    let min = date.getMinutes();
    let meridian = 'AM';
    // set hour
    if (hour === 0) {
      hour = 12;
      finalHr = hour.toString();
    } else if (hour < 10) {
      finalHr = '0' + hour.toString();
    } else if (hour >= 10 && hour < 13) {
      finalHr = hour.toString();
    } else if (hour >= 13 && hour <= 21) {
      hour -= 12;
      meridian = 'PM';
      finalHr = '0' + hour.toString();
    } else if (hour > 21) {
      hour -= 12;
      meridian = 'PM';
      finalHr = hour.toString();
    }
    // set minutes
    if (min < 10) {
      finalMin = '0' + min.toString();
    } else {
      finalMin = min.toString();
    }
    return finalHr + ':' + finalMin + ' ' + meridian;
  }
  /**
   * Convert time in 12h format to 24h
   *
   * @param {string} time [time in 12h format]
   */
  private convert12hTo24h(time: string) {
    let origHour = null;
    let finalHour = null;
    let finalTime = null;

    if (time !== undefined) {
      origHour = time.substring(0, 2);
      // If the hour is on PM, then we need to add 12 to get 24h value
      if (time.indexOf('PM') > -1) {
        if (origHour !== '12') {
          finalHour = parseInt(origHour, 10) + 12;
        } else {
          finalHour = origHour;
        }
        finalTime = finalHour.toString() + time.substr(2, 3);
      } else if (time.indexOf('AM') > -1) {
        // if is 12AM, subtract 12 to get 24h value
        if (origHour === '12') {
          finalTime = '00' + time.substr(2, 3);
        } else {
          // if AM hour isn't 12:00 or 12:30, then only remove meridian value
          finalTime = time.substring(0, 5);
        }
      }
    }

    if (finalTime) {
      finalTime += ':00';
    }
    return finalTime;
  }
  /**
   * Function to get event types and present them to the user in the event modal.
   */
  private getEventTypes() {
    this.eventTypeService.getList()
      .subscribe(eventTypes => {
        let rawEventOptions: any = eventTypes.results;
        let eventTypeOptions: Array<any> = [];
        for (let option of rawEventOptions) {
          eventTypeOptions.push({'id': option.id, 'name': option.name});
        }
        this.eventTypes = eventTypeOptions;
      },
      err =>  {
        console.error(err);
      },
      ()  => {
      }
    );
  }
  /**
   * [onNoteTitleChange description]
   * @param {any}    e    [description]
   * @param {[type]} note [description]
   */
  private eventTitleChanged(e: any, i: number) {
    if (e !== undefined && String(e).trim().length > 0 && e !== this.eventGroups[i].name) {
      if (this.eventGroups[i].id) {
        this.eventGroupService.partialUpdate(this.eventGroups[i].id, {'name': e})
          .subscribe(data => {
            this.eventGroups[i].name = e;
            this.flash.success(`Event was updated successfully.`);
          },
          err => {
            this.flash.error(`There was an error updating event name, please try again later.`);
          },
          () => {}
        );
      } else {
        this.eventGroups[i].name = e;
      }
    }
  }
  /**
   * [eventTitleBlur description]
   * @param {string} e [description]
   * @param {string} e [description]
   */
  private eventTitleBlur(e: any, i: number) {
    if (e === undefined || String(e).trim().length === 0) {
      if (this.eventGroups[i].id) {
        this.eventGroupService.partialUpdate(this.eventGroups[i].id, {'name': 'Untitled'})
          .subscribe(data => {
            this.eventGroups[i].name = 'Untitled';
            this.flash.success(`Event was updated successfully.`);
          },
          err => {
            this.flash.error(`There was an error updating event name, please try again later.`);
          },
          () => {}
        );
      } else {
        this.eventGroups[i].name = 'Untitled';
      }
    }
  }
  /**
   * [getErrors description]
   */
  private getErrors() {
    let errors = false;
    let gralAppointmentIdx = 0; // appointment index considering all appointments of all events
    // check errors on Location Fields
    let firstAddressField = null;
    let errorAddressIdx = null;
    let addresses = this.formAddresses.toArray();
    for (let i = 0; i < addresses.length; i++) {
      let aux = addresses[i].getErrorsFromParent();
      if (aux && !firstAddressField) {
        firstAddressField = aux;
        errorAddressIdx = i;
      }
    }

    this.setErrorVariables();
    for (let i = 0; i < this.events.length; i++) {
      for (let j = 0; j < this.events[i].length; j++) {
        // check errors on Appointment Name
        if (this.events[i][j].name === undefined || String(this.events[i][j].name).trim().length === 0) {
          this.events[i][j].nameError = true;
          if (!errors) {
            errors = true;
            this.iterateOpenAccordion(i, 1);
            this.iterateOpenAccordion(j, 2);
            setTimeout(() => {
              let input = document.getElementById('appointment-name');
              if (input) {
                input.focus();
              }
            }, 300);
          }
        }
        // check errors on Location Name
        if (this.events[i][j].location.name === undefined || String(this.events[i][j].location.name).trim().length === 0) {
          this.events[i][j].locationNameError = true;
          if (!errors) {
            errors = true;
            this.iterateOpenAccordion(i, 1);
            this.iterateOpenAccordion(j, 2);
            setTimeout(() => {
              let input = document.getElementById('location-name');
              if (input) {
                input.focus();
              }
            }, 300);
          }
        }
        // check event date/time errors
        let res = this.checkEventsDateTime(i, j);
        if (res && !errors) {
          errors = true;
          this.iterateOpenAccordion(i, 1);
          this.iterateOpenAccordion(j, 2);
        }
        // check the first field from address that has error to set focus on
        if (firstAddressField) {
          if (!errors && errorAddressIdx !== null && gralAppointmentIdx === errorAddressIdx) {
            errors = true;
            this.iterateOpenAccordion(i, 1);
            this.iterateOpenAccordion(j, 2);
            setTimeout(() => {
              if (firstAddressField) {
                firstAddressField.onSpanClick();
                return;
              }
            }, 300);
          }
        }
        gralAppointmentIdx++;
      }
    }
    return errors;
  }
  /**
   * Save new job name when is edited
   * @param {any} e [new job name]
   */
  private jobNameChanged(e: any) {
    if (e !== undefined && String(e).trim().length > 0 && e !== this.jobData.name && this.jobId) {
      let name = {
        'name': e
      };
      this.jobService.partialUpdate(this.jobId, name)
        .subscribe(data => {
          this.jobData.name = e;
          this.flash.success(`Job was updated successfully.`);
        },
        err => {
          this.flash.error(`There was an error updating job name, please try again later.`);
        },
        () => {}
      );
    }
  }
  /**
   * Input from edited job name blured
   * @param {any} e []
   */
  private jobNameBlur(e: any) {
    if (e === undefined || String(e).trim().length === 0) {
      this.isLoadingHeader = true;
      let name = {
        'name': 'Untitled'
      };
      this.jobService.partialUpdate(this.jobId, name)
        .subscribe(data => {
          this.jobData.name = 'Untitled';
          this.flash.success(`Job was updated successfully.`);
        },
        err => {
          this.flash.error(`There was an error updating job name, please try again later.`);
        },
        () => {
          this.isLoadingHeader = false;
        });
    }
  }
  /**
   * Input from edited job name blured
   * @param {any} e []
   */
  private getAppointmentDate(event: any) {
    let startDate = this.datePipe.transform(event.fixedStartFullDate, 'mediumDate');
    let startHour = this.datePipe.transform(event.fixedStartFullDate, 'shortTime');
    let endDate = this.datePipe.transform(event.fixedEndFullDate, 'mediumDate');
    let endHour = this.datePipe.transform(event.fixedEndFullDate, 'shortTime');

    if (startDate && endDate) {
      if (event.all_day) {
        return startDate;
      } else if (startDate === endDate) {
        return startDate + ' ' + startHour + ' - ' + endHour;
      } else {
        return startDate + ' ' + startHour + ' - ' + endDate + ' ' + endHour;
      }
    }
  }
}
