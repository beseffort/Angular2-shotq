import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { SentCorrespondence } from 'app/models/sentcorrespondence';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { SubscribableOrPromise } from 'rxjs/Observable';
import { Overlay, overlayConfigFactory } from 'single-angular-modal/esm';
import { Modal } from 'single-angular-modal/plugins/bootstrap';
import { BaseEvent } from '../../../models/event';
import { Job, JobApiJobContact } from '../../../models/job';
import { JobContact } from '../../../models/job-contact';
import { JobNote } from '../../../models/job-note';
import { BaseNote } from '../../../models/notes';
import { Role } from '../../../models/role';
import { ContactService } from '../../../services/contact';
import { GeneralFunctionsService } from '../../../services/general-functions';
import { JobContactService } from '../../../services/job-contact/job-contact.service';
import { JobNoteService } from '../../../services/job-note';
import { JobRoleService } from '../../../services/job-role/job-role.service';
import { JobService } from '../../../services/job/';
import { MessagingService } from '../../../services/messaging/messaging.service';
import { SentCorrespondenceService } from '../../../services/sent-correspondence/sent-correspondence.service';
import { BreadcrumbService } from '../../shared/breadcrumb/components/breadcrumb.service';
import {
  ChooseContactComponent, ChooseContactWindowData
} from '../../shared/choose-contact/choose-contact.component';
import { JobsUiService } from '../../shared/jobs-ui/jobs-ui.service';
import { MessagingUiService } from '../../shared/messaging-ui/messaging-ui.service';
import {
  ChangeNoteAction, DeleteNoteAction
} from '../../shared/notes/note-actions';

import { JobContactListDialogComponent } from './contact-list-dialog/contact-list-dialog.component';
import { JobHeaderComponent } from './job-header/job-header.component';
import { EventService } from '../../../services/event/event.service';
import { JobTypeService } from '../../../services/job-type/job-type.service';
import { JobType } from '../../../models/job-type';
import {
  QuickJobComponent,
  QuickJobWindowData
} from '../../top-navbar/quick-job/quick-job.component';

@Component({
  selector: 'job-info',
  templateUrl: 'job-info.component.html',
  styleUrls: ['job-info.component.scss'],
  providers: [
    ContactService, GeneralFunctionsService, JobContactService, JobNoteService,
    JobRoleService, JobTypeService, JobService, SentCorrespondenceService
  ]
})
export class JobInfoComponent implements OnInit, OnDestroy {
  @ViewChild('headerRef') headerRef: JobHeaderComponent;
  @ViewChild(JobContactListDialogComponent) jobContactsDialog: JobContactListDialogComponent;
  public tabs: Array<any> = [
    {
      title: 'Events',
      status: 'events',
      filters: []
    },
    {
      title: 'Proposals & Contracts',
      status: 'proposals_and_contracts',
      filters: []
    },
    {
      title: 'Invoices',
      status: 'invoices',
      filters: [
        {title: 'Contracts', status: 'contracts'},
        {title: 'Invoices', status: 'invoices'},
      ]
    },
    {
      title: 'Contacts & Emails',
      status: 'contacts',
      filters: []
    },
    {
      title: 'Notes & Activity',
      status: 'notes&activity',
      filters: []
    },
  ];
  public currentTab = this.tabs[0];
  public currentStatus = this.currentTab['status'];
  public isLoading = false;
  public jobId: any;
  public job: Job;
  public proposalToShowId: number;
  public invoiceToShowId: number;
  private destroyed = new Subject<void>();
  private notesLoading: boolean;
  private correspondences: SentCorrespondence[] = [];
  private roles: Role[] = [];
  private types: JobType[] = [];
  private notes: JobNote[];
  private responseOK: boolean = false;
  private tabSectionName: string = 'jobs';
  // Sort flags
  private sort = {
    sortedBy: 'date',
    dateCreatedAsc: false,
  };
  private paginator = {
    totalItems: 0,
    currentPage: 1,
    perPage: 3,
  };

  constructor(private breadcrumbService: BreadcrumbService,
              private contactService: ContactService,
              private generalFunctions: GeneralFunctionsService,
              private jobContactService: JobContactService,
              private jobNoteService: JobNoteService,
              private jobRoleService: JobRoleService,
              private jobTypeService: JobTypeService,
              private jobService: JobService,
              private messagingService: MessagingService,
              private messagingUiService: MessagingUiService,
              private presenter: JobsUiService,
              private modal: Modal,
              private router: Router,
              private route: ActivatedRoute,
              private vcRef: ViewContainerRef,
              overlay: Overlay) {
    // This is a workaround for the issue where Modal doesn't work with lazy
    // modules. See http://bit.ly/2qqlpDX for details.
    overlay.defaultViewContainer = vcRef;
    breadcrumbService.addFriendlyNameForRouteRegex('^/jobs/[0-9]+', '');
  }

  /**
   * On component initialization.
   */
  public ngOnInit() {
    this.paginator.totalItems = 0;
    this.notes = [];
    this.notesLoading = false;
    this.responseOK = false;
    this.jobNoteService.remoteDataHasChanged
      .takeUntil(this.destroyed)
      .subscribe(() => this.getJobNotes());
    /* Get job id from url params */
    this.generalFunctions.getUrlParams()
      .subscribe(
        params => {
          if (params['id']) {
            this.jobId = +params['id'];
            if (this.jobId !== undefined && this.jobId !== null) {
              //noinspection JSIgnoredPromiseFromCall
              Observable.forkJoin(
                this.getJobNotes(), this.fetchObject(),
                this.jobRoleService.getList(),
                this.jobTypeService.getList(),
                this.getJobCorrespondence())
                .takeUntil(this.destroyed)
                .subscribe(([notes, job, roles, types, messages]) => {
                  this.roles = _.map(roles.results || [], JobRoleService.newObject);
                  this.types = _.map(types.results || [], JobTypeService.newObject);
                  if (this.job && this.job.name) {
                    this.breadcrumbService.addFriendlyNameForRouteRegex(
                      '^/jobs/[0-9]+',
                      ` ${this.generalFunctions.toTitleCase(this.job.name)}`
                    );
                  }
                });
            }
          }
        },
        err => console.error.bind(console)
      );

    this.router.events
      .filter(event => event instanceof NavigationEnd)
      .subscribe((event) => {
        let invoiceId = this.route.snapshot.queryParams['invoice'];
        if (this.route.snapshot.queryParams['invoice']) {
          this.currentTab = _.find(this.tabs, {status: 'invoices'});
          this.invoiceToShowId = invoiceId;
          return;
        }

        if (this.route.snapshot.queryParams['proposal']) {
          this.currentTab = _.find(this.tabs, {status: 'proposals_and_contracts'});
          return;
        }
      });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private fetchObject(): Observable<Job> {
    this.isLoading = true;
    let result = this.jobService.get(this.jobId);
    //noinspection JSIgnoredPromiseFromCall
    result
      .takeUntil(this.destroyed)
      .subscribe(
        jobData => {
          this.resetJob(jobData);
        },
        console.error.bind(console),
        () => {
          this.isLoading = false;
        });
    return result;
  }

  private resetJob(jobData: any) {
    this.job = JobService.newObject(jobData);
    // An event is required to render a message template on the server side,
    // so we pass it to the service in case the user will try to create
    // a message from a template.
    this.messagingUiService.event = EventService.newObject(this.job.main_event_details);
    // upgrade the job contacts so we can use `JobApiJobContact` methods
    this.job.job_contacts = _.map(this.presenter.sortedJobContacts(this.job), item => {
      return Object.assign(new JobApiJobContact(), item);
    });
  }

  private getJobCorrespondence(): Observable<SentCorrespondence[]> {
    let result = this.messagingService
      .getList({job: this.jobId})
      .map(response => {
        return _.map(response.results, item => Object.assign(new SentCorrespondence(), item));
      });
    //noinspection JSIgnoredPromiseFromCall
    result.takeUntil(this.destroyed)
      .subscribe(correspondences => {
        this.correspondences = correspondences;
      });
    return result;
  }

  /**
   * Function to get job notes form the API.
   */
  private getJobNotes(): Observable<any> {
    this.notesLoading = true;
    let result = this.jobNoteService.getListByJob(this.jobId);
    //noinspection JSIgnoredPromiseFromCall
    result.takeUntil(this.destroyed)
      .subscribe(
        response => {
          this.notes = response.jobNotes || [];
          this.paginator.totalItems = response.total;
          this.responseOK = true;
        },
        err => {
          console.error(err);
          if (err.status === 404) {
            this.notesLoading = false;
            //noinspection JSIgnoredPromiseFromCall
            this.router.navigate(['/not-authorized']);
          }
        },
        () => {
          this.notesLoading = false;
        }
      );
    return result;
  }

  /**
   * Display a dialog to select an existing contact or create a new contact
   * to be added to the job.
   */
  private addJobContact() {
    this.modal
      .open(ChooseContactComponent, overlayConfigFactory({
        jobId: this.jobId,
        parentRef: this
      }, ChooseContactWindowData))
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            this.ngOnInit();
          })
          .catch(() => {});
      });


  }

  //noinspection JSUnusedLocalSymbols
  private saveJobContact(jobContact: JobApiJobContact) {
    let data = {
      id: jobContact.id,
      roles: _.map(jobContact.roles, 'id')
    };
    // The job contacts are the part of the `Job` resource, so reload
    // the whole job object to make sure that the data is up to date.
    //noinspection JSIgnoredPromiseFromCall
    this.jobContactService.partialUpdate(jobContact.id, data)
      .flatMap(() => this.fetchObject())
      .subscribe(() => {
          this.presenter.displaySuccessMessage('The contact has been updated.');
        },
        console.error.bind(console));
  }

  //noinspection JSUnusedLocalSymbols
  /**
   * Display a dialog with all the job contacts listed.
   */
  private displayAllJobContacts() {
    this.jobContactsDialog.show();
  }

  //noinspection JSUnusedLocalSymbols
  private onChangeJob() {
    this.modal
      .open(QuickJobComponent, overlayConfigFactory({job: this.job}, QuickJobWindowData))
      .then(dialogRef => {
        dialogRef.result
          .then(() => this.fetchObject())
          .catch(() => {});
      });
  }

  //noinspection JSUnusedLocalSymbols
  /**
   * Displays the modal dialog for changing the job contact.
   * @param jobContact The job contact to change.
   */
  private onChangeJobContact(jobContact: JobApiJobContact) {
    let isContactsDialogVisible = this.jobContactsDialog.isVisible;
    if (isContactsDialogVisible)
      this.jobContactsDialog.hide();
    //noinspection JSIgnoredPromiseFromCall
    this.presenter.displayAddOrUpdateJobContactDialog(jobContact)
      .finally(() => {
        if (isContactsDialogVisible)
          this.jobContactsDialog.show();
      })
      .subscribe(result => {
        this.saveJobContact(result);
      });
  }

  //noinspection JSUnusedLocalSymbols
  private archiveJobContacts(jobContacts: JobApiJobContact[]) {
    let requests: SubscribableOrPromise<JobContact>[] = _(jobContacts)
      // keep only non-primary job contacts
      .filter(item => {
        if (this.job.isPrimaryJobContact(item)) {
          this.presenter.displayErrorMessage('You cannot archive the job primary contact');
          return false;
        }
        return _.findIndex(this.job.job_contacts, ['id', item.id]) >= 0;
      })
      .map(item => {
        return this.contactService.archiveContact(item.contact);
      })
      .value();
    if (!requests.length)
      return;

    if (requests.length > 1) {
      //noinspection JSIgnoredPromiseFromCall
      this.presenter.displayYesNoMessage(
          `Do you really want to archive ${requests.length} contacts?`
        )
        .filter(_.identity)
        .subscribe(result => performArchive.call(this));
    } else {
      performArchive.call(this);
    }

    function performArchive() {
      this.isLoading = true;
      //noinspection JSIgnoredPromiseFromCall
      Observable.forkJoin(requests)
        .takeUntil(this.destroyed)
        .subscribe(() => {
            let message = requests.length > 1 ?
              'The contacts has been archived' :
              'The contact has been archived';
            this.presenter.displaySuccessMessage(message);
            this.fetchObject();
          },
          console.error.bind(console),
          () => {
            this.isLoading = false;
          }
        );
    }
  }

  //noinspection JSUnusedLocalSymbols
  /**
   * Removes the contacts from the current job.
   * @param jobContacts The contacts to be removed.
   */
  private deleteJobContacts(jobContacts: JobApiJobContact[]) {
    let requests: SubscribableOrPromise<JobContact>[] = _(jobContacts)
      // keep only non-primary job contacts
      .filter(item => {
        if (this.job.isPrimaryJobContact(item)) {
          this.presenter.displayErrorMessage('You cannot delete the job primary contact');
          return false;
        }
        return _.findIndex(this.job.job_contacts, ['id', item.id]) >= 0;
      })
      .map(item => {
        return this.jobContactService.delete(item.id);
      })
      .value();
    if (!requests.length)
      return;

    if (requests.length > 1) {
      //noinspection JSIgnoredPromiseFromCall
      this.presenter.displayYesNoMessage(
          `Do you really want to delete ${requests.length} contacts from the job?`,
        )
        .filter(_.identity)
        .subscribe(result => performDelete.call(this));
    } else {
      performDelete.call(this);
    }

    function performDelete() {
      this.isLoading = true;
      //noinspection JSIgnoredPromiseFromCall
      Observable.forkJoin(requests)
        .takeUntil(this.destroyed)
        .subscribe(() => {
            let message = requests.length > 1 ?
              'The contacts were deleted from the job' :
              'The contact was deleted from the job';
            this.presenter.displaySuccessMessage(message);
            this.fetchObject();
          },
          console.error.bind(console),
          () => {
            this.isLoading = false;
          }
        );
    }
  }

  //noinspection JSUnusedLocalSymbols
  private setAsPrimaryJobContact(jobContact: JobApiJobContact) {
    this.isLoading = true;
    //noinspection JSIgnoredPromiseFromCall
    this.jobService.resetJobPrimaryContactId(this.jobId, jobContact.contact)
      .takeUntil(this.destroyed)
      .subscribe(
        jobData => {
          this.resetJob(jobData);
        },
        err => {
          console.error(err);
          this.presenter.displayErrorMessage('The contact cannot be updated.');
        },
        () => {
          this.presenter.displaySuccessMessage('The contact has been updated.');
          this.isLoading = false;
        }
      );
  }


  // <editor-fold desc="Job notes operations">
  /**
   * Removes the given notes from the current job.
   */
  private deleteNotes(notes: JobNote[]) {
    let requests: SubscribableOrPromise<JobContact>[] = _(notes)
      .map(item => {
        return this.jobNoteService.delete(item.id);
      })
      .value();
    if (!requests.length)
      return;

    let message = requests.length === 1 ?
      `Do you really want to delete this note from the job?` :
      `Do you really want to delete ${requests.length} notes from the job?`;
      //noinspection JSIgnoredPromiseFromCall
      this.presenter.displayYesNoMessage(message)
        .filter(_.identity)
        .subscribe(result => performDelete.call(this));

    function performDelete() {
      this.isLoading = true;
      //noinspection JSIgnoredPromiseFromCall
      Observable.forkJoin(requests)
        .takeUntil(this.destroyed)
        .subscribe(() => {
            this.presenter.displaySuccessMessage(requests.length > 1 ?
              'The notes were deleted from the job' :
              'The note was deleted from the job');
          },
          err => {
            this.isLoading = false;
            console.error(err);
            this.presenter.displayErrorMessage(requests.length > 1 ?
              'The notes could not be deleted.' :
              'The note could not be deleted.');
          },
          () => {
            this.isLoading = false;
          }
        );
    }
  }

  /**
   * Function that handle the action selected in the note dropdown.
   *
   * @param {any} option [description]
   */
  private onNoteActionClicked(data: any) {
    switch (data.action.id) {
      case ChangeNoteAction.id:
        break;
      case DeleteNoteAction.id:
        this.deleteNotes([data.note as JobNote]);
        break;
      default:
        break;
    }
  }

  //noinspection JSUnusedLocalSymbols
  /**
   * Function to create or update a note thorough API.
   *
   * @param {any} data [description]
   */
  private saveNote(data: BaseNote) {
    let note = new JobNote(data.id, data.subject, data.body, this.job.id);
    let isNewObject = !note.id;
    let request = isNewObject ? this.jobNoteService.create(note) :
        this.jobNoteService.update(note.id, note);
    //noinspection JSIgnoredPromiseFromCall
    request.takeUntil(this.destroyed)
      .subscribe(
        response => {
          this.presenter.displaySuccessMessage(
            isNewObject ? 'The note has been created.' : 'The note has been saved.');
          this.responseOK = true;
        },
        err => {
          console.error(err);
          this.presenter.displayErrorMessage(
            isNewObject ? 'The note could not be created.' : 'The note could not be saved.');
        }
      );
  }
  // </editor-fold>


  //noinspection JSUnusedLocalSymbols
  private onDisplayMessage(message: SentCorrespondence) {
    this.messagingUiService.displayViewMessageDialog(message, this.vcRef).subscribe();
  }

  //noinspection JSUnusedLocalSymbols
  private onCreateMessage() {
    let message = SentCorrespondenceService.newObject();
    this.messagingUiService.displayComposeMessageDialog(message, this.vcRef)
      .subscribe(changedMessage => {
        // make sure that the job ID is set to the current job
        changedMessage.job = this.job.id;
        this.messagingService.createMessage(changedMessage)
          .subscribe(response => {
            this.presenter.displaySuccessMessage('Message successfully created');
          });
      });
  }

  //noinspection JSUnusedLocalSymbols
  private onMainEventChanged(event: BaseEvent) {
    this.messagingUiService.event = event;
  }

  //noinspection JSUnusedLocalSymbols
  /**
   * Handle tab change
   * @param {any} index [tab index]
   */
  private handleTabChange(index) {
    let tab = this.tabs[index];
    this.currentTab = tab;
    this.currentStatus = tab.status;
  }

  //noinspection JSUnusedLocalSymbols
  /**
   * Handle page change from paginator
   * @param {any} event [event]
   */
  private handlePageChange(event: any) {
    this.paginator.currentPage = event.currentPage;
    this.paginator.perPage = event.perPage;
    this.getJobNotes();
  }
}
