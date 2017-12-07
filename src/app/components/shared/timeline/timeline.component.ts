/**
 * Component TimelineComponent
 */
import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SingleActions } from './menu-items';
import { ModalService }            from '../../../services/modal/';
import { JobService } from '../../../services/job/';
import { AddEventModule }          from '../../+jobs/jobs-info/add-event/add-event.module';

@Component({
  selector: 'timeline',
  templateUrl: 'timeline.component.html',
  styleUrls: ['timeline.component.scss'],
  providers: [JobService],
  encapsulation: ViewEncapsulation.None
})
export class TimelineComponent {
  @Output() eventChanged  = new EventEmitter();
  @Input() showEditButton: boolean = true;
  @Input() showTitle: boolean = false;
  @Input() collapsibleAppointments: boolean = false;
  @Input() paramJobId: number;
  private singleActions = SingleActions;
  private solvingConflict: boolean = false;
  private events: any = [];
  private sub: any;
  private job: any;
  private modalInstance = null;
  private setClickEventHandlersFlag: boolean = false;
  private isLoading: boolean = false;
  private mainEventId: number;
  private jobId: number;


  constructor(private modalService: ModalService, private jobService: JobService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.isLoading = true;
    this.sub = this.route.params.subscribe(params => {
      if (params['id']) {
        this.jobId = +params['id']; // (+) converts string 'id' to a number
      } else if (this.paramJobId) {
        this.jobId = this.paramJobId;
      }
      this.jobService.get(this.jobId)
        .subscribe(
          data => {
            this.mainEventId = data.main_event;
            this.job = data;
            if (data.eventgroups && data.eventgroups !== undefined) {
              this.getEvent(data.eventgroups);
            }
          },
          err => console.error(err),
          () => {
            this.isLoading = false;
          });
        },
        err => console.error(err),
        () => {
          this.isLoading = false;
        }
      );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  ngAfterViewInit() {
    // this close the conflict event resolver when clicks outside the resolver div
    let $this = this;
    document.onclick = function(e: any) {
      let className = e.target.className;
      let el: any = document.querySelector('#timelineBlock .solve-conflict');
      if ($this.solvingConflict && className !== 'conflict-event' && className !== 'conflict-click-zone' &&
        e.target.parentElement && e.target.parentElement.className !== 'solve-conflict') {
        $this.hideSolveConflict();
      }
    };
  }

  /**
   * Handle click event to solve an event conflict
   * @param {[type]} timelineEvent [description]
   */
  private solveConflict(timelineEvent, parent) {
    if (timelineEvent.showSolveConflict) {
      timelineEvent.showSolveConflict = false;
      this.solvingConflict = false;
    } else {
      timelineEvent.showSolveConflict = true;
      this.solvingConflict = true;
    }
  }
  /**
   * Hide the solve conflict window
   */
  private hideSolveConflict() {
    if (this.solvingConflict) {
      this.solvingConflict = false;
      let flag = false;
      for (let event of this.events) {
        if (event.hasSubevents) {
          for (let ev of event.subevents) {
            if (ev.showSolveConflict) {
              ev.showSolveConflict = false;
              flag = true;
              break;
            }
          }
          if (flag) {
            break;
          }
        } else if (event.showSolveConflict) {
          event.showSolveConflict = false;
          break;
        }
      }
    }
  }

  /**
   * Dissmiss conflict click event handler
   * @param {[type]} timelineEvent [description]
   */
  private dismissConflict(timelineEvent) {
    // timelineEvent.hasConflict = false;
    timelineEvent.showSolveConflict = false;
    this.solvingConflict = false;
  }

  /**
   * Dissmiss conflict click event handler
   * @param {[type]} timelineEvent [description]
   */
  private viewJob(timelineEvent) {
    timelineEvent.showSolveConflict = false;
    this.solvingConflict = false;
  }

  /**
   * Open a new tab searching for the address on Google Maps
   * @param {[type]} timelineEvent [description]
   */
  private addressClick(timelineEvent, parent) {
    if (parent) {
      parent.expanded = true;
    }
    let url = 'http://maps.google.com/maps/search/';
    if (timelineEvent.location.street) {
      url += timelineEvent.location.street + '+';
    }
    if (timelineEvent.location.city) {
      url += timelineEvent.location.city + '+';
    }
    if (timelineEvent.location.state) {
      url += timelineEvent.location.state + '+';
    }
    if (timelineEvent.location.zip) {
      url += timelineEvent.location.zip + '+';
    }

    if (url.substr(url.length - 1) === '+') {
      url.replace(/.$/, '/');
    }
    window.open(url);
  }
  /**
   * [modalAddEventOpen description]
   */
  private modalAddEventOpen() {
    this.jobService.get(this.jobId)
      .subscribe(
        jobData => {
          let title = '';
          let style = 'modal-lg jobInfoBlock';
          this.modalService.setModalContent(AddEventModule, title, style);
          this.modalService.showModal();
          let subscriber = this.modalService.templateChange.subscribe(data => {
            this.modalInstance = data.instance;
            this.modalInstance.setComponentRef(this);
            this.modalInstance.jobData = this.job;
          });
          this.modalService.subscribeTemplateChange(subscriber);
          let hiddenModalSubs = this.modalService.hiddenModal.subscribe(res => {
             let modalData = this.modalService.data;
              if (modalData !== undefined && modalData.eventChanged !== undefined && modalData.eventChanged === true) {
                this.eventChanged.emit(true);
                this.modalService.data = {};
              }
          });
          this.modalService.subscribeHiddenModal(hiddenModalSubs);
        },
        err => {
         console.error(err);
         this.isLoading = false;
        },
        () => {
          this.isLoading = false;
        }
      );
  }
  /**
   * [getEvent description]
   * @param {any} eventgroups [description]
   */
  private getEvent(eventgroups: any) {
    this.events = [];
    for (let e of eventgroups) {
      let aux: any = {
        id: e.id,
        mainEvent: (this.mainEventId && this.mainEventId === e.id),
        past: null,
        expanded: (this.mainEventId && this.mainEventId === e.id),
        name: '',
        hasSubevents: false,
        date: {
          start: null,
          end: null
        }
      };
      if (e.name) {
        aux.name = e.name;
      }
      if (e.events && e.events.length > 0) {
        aux.past = this.eventPass(e.events[e.events.length - 1].end);
        aux.hasSubevents = true;
      }
      aux['subevents'] = [];
      for (let subevent of e.events) {
        let a = {
          id: subevent.id,
          name: subevent.name,
          past: this.eventPass(subevent.end),
          hasConflict: subevent.has_conflict,
          allDay: subevent.all_day,
          location: {
            name: '' || e.address,
            street: '',
            city: '',
            state: '',
            zip: ''
          },
          expanded: false
        };

        if (subevent.location) {
          a.location.name = (subevent.location.name) ? subevent.location.name : '';
          a.location.street = (subevent.location.address1) ? subevent.location.address1 : '';
          a.location.city = (subevent.location.city) ? subevent.location.city : '';
          a.location.state = (subevent.location.state) ? subevent.location.state : '';
          a.location.zip = (subevent.location.zip) ? subevent.location.zip : '';
        }

        if (a.hasConflict && subevent.conflicts.length > 0) {
          let evAux = subevent.conflicts[0];
          a['conflicts'] = {
            id: evAux.id,
            name: evAux.name,
            start: evAux.start,
            end: evAux.end,
            jobId: undefined,
            jobName: 'Job Name'
          };
        }

        aux['subevents'].push(a);

      }
      this.events.push(aux);
    }
  }
  /**
   * [eventPass description]
   * @param {string} dateString [description]
   */
  private eventPass(dateString: string) {
    let today =  new Date();
    let date = new Date(dateString);
    if (today > date) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Handle open accordion event
   * @param {[type]} $event [description]
   */
  private onOpenAccordion(e: any, shootqEvent: any) {
  }
  /**
   * Handle close accordion event
   * @param {any} e [description]
   */
  private onCloseAccordion(e: any, shootqEvent: any) {
  }
  /**
   * Handle toggle accordion event
   * @param {any} e [description]
   */
  private onToggleAccordion(e: any, shootqEvent: any) {
    shootqEvent.expanded = !shootqEvent.expanded;
    this.disableSolveConflict(shootqEvent);
  }
  /**
   * Handle toggle accordion appointment
   * @param {any} e [description]
   */
  private onToggleSubAccordion(e: any, appointment: any) {
    appointment.expanded = !appointment.expanded;
  }
  /**
   * Hide show conflict windows if accordion is closed
   * @param {any} shootqEvent [description]
   */
  private disableSolveConflict(shootqEvent: any) {
    if (shootqEvent.expanded) {
      if (shootqEvent.hasSubevents) {
        for (let ev of shootqEvent.subevents) {
          if (ev.showSolveConflict) {
            ev.showSolveConflict = false;
            break;
          }
        }
      } else {
        if (shootqEvent.showSolveConflict) {
          shootqEvent.showSolveConflict = false;
        }
      }
    }
  }
}
