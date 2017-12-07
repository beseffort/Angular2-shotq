import {
  Component,
  OnInit,
  Inject,
  ViewContainerRef
}                                  from '@angular/core';
import { Router }                  from '@angular/router';
import { DOCUMENT }                from '@angular/platform-browser';
/* Components */
/* Services */
import { JobService }              from '../../../services/job';
import { ModalService }            from '../../../services/modal/';
import { JobTypeService }          from '../../../services/job-type/';
import { JobRoleService }          from '../../../services/job-role/';
import { ContactService }          from '../../../services/contact';
import { FlashMessageService }     from '../../../services/flash-message';
import { ApiService }              from '../../../services/api';
import { GeneralFunctionsService } from '../../../services/general-functions';
/* Models */
import { archivedJobStatus, deletedJobStatus, activeJobStatus, Job } from '../../../models/job';
import { EventType } from '../../../models/event-type';
/* Modules */
import { QuickJobComponent, QuickJobWindowData } from '../../top-navbar/quick-job/quick-job.component';
import { overlayConfigFactory, Overlay } from 'single-angular-modal';
import { Modal } from 'single-angular-modal/plugins/bootstrap';

declare let require: (any);

@Component({
  selector: 'app-jobs',
  templateUrl: 'jobs.component.html',
  styleUrls: ['jobs.component.scss'],
  providers: [JobService, JobTypeService, JobRoleService, ContactService]
})
export class JobsComponent implements OnInit {

  public tabs: Array<any> = [
    {
      title: 'Opportunities', filters: []
    },
    {
      title: 'Proposed jobs', status: 'proposed_open',
      filters: [
        {title: 'Open', status: 'proposed_open'},
        {title: 'Accepted', status: 'proposed_accepted'},
        {title: 'Rejected', status: 'proposed_rejected'},
        {title: 'Pending Signature', status: 'proposed_pending_signature'},
        {title: 'Pending Review', status: 'proposed_pending_review'}
      ]
    },
    {
      title: 'Booked jobs', status: 'booked', filters: []
    },
    {
      title: 'History', status: 'completed',
      filters: [
        {title: 'Completed Jobs', status: 'completed'},
        {title: 'Archived Opportunities', status: 'dead_lead'},
        {title: 'Archived Jobs', status: 'archived'},
        {title: 'Cancelled Jobs', status: 'canceled'}
      ]
    }
  ];
  public currentTab =                this.tabs[0];
  public currentStatus =             this.currentTab['status'];
  public orderBy:                    string = 'name';
  public orderDirection:             string;
  public currentFilter:              string = '';
  public jobs:                       Job[] = [];
  public totalItems:                 number = 0;
  public currentPage:                number = 1;
  public perPage:                    number = 0;
  public isLoading:                  boolean = false;
  public isArchived: boolean = false;

  public checkedJobIds:              number[] = [];
  private _ =                        require('../../../../../node_modules/lodash');
  private hasPages:                  boolean = false;
  private hideHeaderTitle:           boolean = false;
  private updateTable:               boolean = true;
  private jobTypes:                  EventType[] = [];
  private listWorker:                string = '';
  private worker:                    string = '';
  private roles:                     Array<any> = [];
  private search_box:                string;
  private client = {
    'name': '',
    'phone': ''
  };
  private orderByDirection = {
    'name': 'asc',
    'job_type__name': 'asc',
    'internal_owner__user_profile__user__first_name': 'asc',
    'external_owner__first_name': 'asc',
    'main_event_date': 'asc',
    'next_event_date': 'asc'
  };
  /** @type {Object} Action bar style configuration object */
  private actionsBar = {
    color: 'gray',
    enabled: false,
    deleteBtn: {
      message: 'Are you sure that you want to do this?',
    }
  };

  private paginator = {
    totalItems: 100,
    currentPage: 1,
    perPage: 0,
  };

  constructor( @Inject(DOCUMENT)
    private document:         Document,
    private jobService:       JobService,
    private jobTypeService:   JobTypeService,
    private jobRoleService:   JobRoleService,
    private flash:            FlashMessageService,
    private generalFunctions: GeneralFunctionsService,
    private modal: Modal,
    private overlay: Overlay,
    private vcRef: ViewContainerRef,
    private router: Router
  ) {
    overlay.defaultViewContainer = vcRef;
  }

  ngOnInit() {
    this.jobTypeService.getList()
      .subscribe(types => {
        this.jobTypes = types.results;
    });

    this.jobRoleService.getList()
      .subscribe(data => {
        this.roles = [{
          id: 0,
          name: '-'
        }];
        for (let role of data.results) {
          this.roles.push(role);
        }
      });
    this.loadJobs();
  }

  toggleView() {
    this.isArchived = !this.isArchived;
    this.search_box = '';
    this.reloadJobs();
  }

  getJobFilter() {
    let ordering = `${this.orderByDirection[this.orderBy] === 'desc' ? '-' : ''}${this.orderBy}`,
      filter;

    filter = {
      ordering: ordering,
      filter: this.currentFilter,
      page: this.currentPage,
      page_size: this.perPage
    };
    if (this.isArchived)
      filter['status'] = archivedJobStatus;
    else
      filter['status!'] = archivedJobStatus;

    return filter;
  }

  /**
   * Function to load jobs from API.
   */
  loadJobs() {
    let filter = this.getJobFilter();

    this.isLoading = true;
    this.updateTable = true;
    this.jobService
      .getList(filter)
      .subscribe(
        ({jobs, total}: {jobs: Job[], total: number}) => {
          this.jobs = jobs;
          this.totalItems = total;
          this.checkedJobIds = [];
          this.hasPages = (this.perPage !== 0 && this.totalItems > this.perPage);
          this.setTableWidth();
        },
        (err) => {
          console.error(err);
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
          this.updateTable = true;
        }
      );
  }

  ngAfterViewInit() {
    let $this = this;
    // Add handler to recalculate table height when window is resized
    window.onresize = function() {
      $this.setTableWidth();
    };

    // Add scroll event handler
    let tableBody: any = this.document.querySelector('#table-container table tbody');
    let tableHeader: any = this.document.querySelector('table.scroll thead');
  }
  /**
   * [reloadJobs description]
   */
  reloadJobs() {
    this.currentPage = 1;
    this.currentFilter = '';
    this.loadJobs();
  }

  /**
   * [handleTabChange description]
   * @param {[type]} index [description]
   */
  public handleTabChange(index) {
    let tab = this.tabs[index];
    if (this.currentTab !== tab) {
      this.currentTab = tab;
      this.currentStatus = tab.status;
      this.hideHeaderTitle = false;
      this.reloadJobs();
      let tableBody: any = this.document.querySelector('#table-container table tbody');
      if (tableBody && tableBody.scrollTop) {
        tableBody.scrollTop = 0;
      }
    }
  }
  /**
   * [handlePageChange description]
   * @param {[type]} $event [description]
   */
  public handlePageChange($event) {
    // Prevent loading when currentPage was changed by reloadJobs()
    if (this.currentPage === $event.page && this.perPage === $event.perPage) return;

    this.currentPage = $event.page;
    this.perPage = $event.perPage;
    this.loadJobs();
  }

  confirmDelete() {
    this.modal
      .confirm()
      .isBlocking(true)
      .showClose(false)
      .title('Delete jobs?')
      .dialogClass('modal-dialog modal-confirm')
      .body('Are you sure you want to delete selected jobs? <br/> ' +
        'You will not be able to restore once deleted.')
      .okBtn('Delete')
      .okBtnClass('btn btn_xs btn_red pull-right')
      .cancelBtnClass('btn btn_xs btn_transparent')
      .open()
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            this.updateSelected(deletedJobStatus);
          })
          .catch(() => {});
      });
  }

  confirmRestore() {
    this.modal
      .confirm()
      .isBlocking(true)
      .showClose(false)
      .title('Restore jobs?')
      .dialogClass('modal-dialog modal-confirm')
      .body('Are you sure you want to restore selected jobs?')
      .okBtn('Restore')
      .okBtnClass('btn btn_xs btn_blue pull-right')
      .cancelBtnClass('btn btn_xs btn_transparent')
      .open()
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            this.updateSelected(activeJobStatus);
          })
          .catch(() => {});
      });
  }

  confirmArchive() {
    this.modal
      .confirm()
      .isBlocking(true)
      .showClose(false)
      .title('Archive jobs?')
      .dialogClass('modal-dialog modal-confirm')
      .body('Are you sure you want to archive selected jobs?')
      .okBtn('Archive')
      .okBtnClass('btn btn_xs btn_red pull-right')
      .cancelBtnClass('btn btn_xs btn_transparent')
      .open()
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            this.updateSelected(archivedJobStatus);
          })
          .catch(() => {});
      });
  }

  /**
   * [updateSelected description]
   * @param {[type]} status [description]
   */
  public updateSelected(status) {
    this.isLoading = true;
    let updateData = this._.map(this.checkedJobIds, (id) => {
      return {id: id, status: status};
    });
    this.jobService
      .bulkUpdate(updateData)
      .subscribe(
        () => {
          this.flash.success('Jobs are successfully updated.');
          this.reloadJobs();
        },
        (error) => {
          console.error(JSON.stringify(error));
          this.flash.error('Error while updating jobs.');
          this.isLoading = false;
        }
      );
  }
  /**
   * [getClient description]
   * @param {any} client [description]
   */
  public getClient(client: any) {
    let owner = false;
    this.client.name = '';
    this.client.phone = '';
    if (client !== null) {
     this.client.name = client.first_name + ' ' + client.last_name;
     this.client.phone = client.default_phone_number;
     owner = true;
    }
    return owner;
  }
  /**
   * [getJobWorker description]
   * @param {any} workers [description]
   */
  public getJobWorker(workers: any) {
    let moreWorker = false;
    this.worker = '';
    this.listWorker = '';
    if (workers.length > 0) {
       this.worker = workers[0].name;
       if (workers.length > 1) {
          moreWorker = true;
          this.listWorker = workers[1].name;
          for (let c = 2; c < workers.length; c++) {
            this.listWorker += ', ' + workers[c].name;
          }
       }
    }
    return moreWorker;
  }
  /**
   * [getRoute description]
   * @param {any} job [description]
   */
  public getRoute(job: any) {
    let route = '';
    if (job.external_owner !== null) {
      route = '/contacts/profile/' + job.external_owner.id;
    }
    return route;
  }
  /**
   * [toggleCheckAll description]
   */
  public toggleCheckAll() {
    this.checkedJobIds = this.isAllChecked() ? [] : this._.map(this.jobs, 'id');
  }
  /**
   * [isAllChecked description]
   */
  public isAllChecked() {
    if (this.jobs !== undefined && this.checkedJobIds !== undefined) {
      return this.checkedJobIds.length === this.jobs.length;
    }
  }
  /**
   * [toggleCheck description]
   * @param {Job} job [description]
   */
  public toggleCheck(job: Job) {
    this.isChecked.bind(this)(job) ? this._.pull(this.checkedJobIds, job.id) : this.checkedJobIds.push(job.id);
  }

  public isChecked(job: Job) {
    return this.checkedJobIds.indexOf(job.id) >= 0;
  }

  /**
   * Function to set the width of the th element of the table.
   */
  private setTableWidth() {
    if (!this.document)
      return;
    setTimeout(() => {
      this.generalFunctions.setTableWidth(this.document);
    });
  }
  /**
   * Function to set the height of the th element of the table.
   */
  private setTableHeight() {
    this.generalFunctions.setTableHeight(this.document);
  }
  /**
   * Open modal with the create quick job
   */
  private openNewJobModal() {
    this.modal
      .open(QuickJobComponent, overlayConfigFactory({job: {}}, QuickJobWindowData))
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            setTimeout(() => {
              this.router.navigate(['/jobs', result.id]);
            }, 300);
          })
          .catch(() => {});
      });
  }
  /**
   * Function to search jobs calling API.
   * @param {event} e [description]
   */
  private search(e?: any) {
    if (e && e.keyCode === 27) {
      return false;
    }
    this.isLoading = true;
    if (e && e.keyCode === 8 && this.search_box === '') {
      // If user deletes characters and search box is empty, clear contact
      this.jobs = [];
      this.isLoading = false;
      this.searchJobs();
    }
    if (e) {
      // Each time the user type a letter the page should be set to 1
      this.paginator.currentPage = 1;
      this.isLoading = true;
    }
    if (this.search_box !== '' && typeof this.search_box !== undefined) {
      this.searchJobs();
    } else {
      this.loadJobs();
    }
  }
  /**
   * Function to search jobs in list.
   */
  private searchJobs() {
    let page_options = {};
    if (this.paginator.perPage !== 0) {
      page_options = {
        page: this.paginator.currentPage,
        page_size: this.paginator.perPage,
        archived: 'False',
        active: 'True'
      };
    } else {
      page_options = {
        archived: 'False',
        active: 'True'
      };
    }
    if (this.search_box) {
      page_options['search'] = this.search_box;
    }
    /* API call */
    this.jobService
      .getList(page_options)
      .subscribe(response => {
          this.paginator.totalItems = response.total;
          this.totalItems = response.total;
          this.jobs = response.jobs;
          this.checkedJobIds = [];
          this.actionsBar.enabled = false;
          this.setTableWidth();
        },
        err => {
          console.error(`ERROR: ${err}`);
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
          setTimeout(() => {
            this.setTableWidth();
          });
        }
      );
  }
}
