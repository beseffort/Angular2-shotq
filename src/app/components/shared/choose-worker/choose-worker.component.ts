import { Component } from '@angular/core';

import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash';
import { BSModalContext } from 'single-angular-modal/plugins/bootstrap';
import { DialogRef } from 'single-angular-modal';

import { GeneralFunctionsService } from '../../../services/general-functions';
import { WorkerService } from '../../../services/worker';
import { JobWorkerService } from '../../../services/job-worker';
import { JobRoleService } from '../../../services/job-role';
import { Job } from '../../../models/job';
import { JobService } from '../../../services/client-access/job/job.service';



export class ChooseWorkerWindowData extends BSModalContext {
  public jobData: Job;
  public openAddEvent?: boolean;
}

@Component({
  selector: 'choose-worker',
  templateUrl: './choose-worker.component.html',
  styleUrls : ['./choose-worker.component.scss'],
  providers: [GeneralFunctionsService, WorkerService, JobWorkerService, JobRoleService, JobService]
})
export class ChooseWorkerComponent {
  openAddEvent: boolean = false;
  jobData = new Job;
  searchTextChanged: Subject<string> = new Subject<string>();

  private search_box: string;
  private currentFilter: string = 'all';
  private totalItems: number = 0;
  private currentPage: number = 1;
  private perPage: number = 100;
  private isLoading: boolean = false;
  private workersToSave: Array<any> = [];
  private componentRef;
  private workers: Array<any> = [];
  private jobRoles: Array<any> = [];
  private initialWorkers: Array<any> = [];
  private selectedItemsCount: number = 0;

  constructor(
    public dialog: DialogRef<ChooseWorkerWindowData>,
    private generalFunctions: GeneralFunctionsService,
    private workerService: WorkerService,
    private jobWorkerService: JobWorkerService,
    private jobRoleService: JobRoleService,
    private jobService: JobService
  ) {
    // Initialize search input.
    this.search_box = '';
    this.searchTextChanged
      .debounceTime(1000) // wait 300ms after the last event before emitting last event
      .distinctUntilChanged() // only emit if value is different from previous value
      .subscribe(text => {
        this.search_box = text;
        this.search(true);
      });
  }

  ngOnInit() {
    this.jobData = this.dialog.context.jobData;
    this.openAddEvent = this.dialog.context.openAddEvent;
    this.selectedItemsCount = this.jobData.job_workers.length;
    this.getRoles();
    this.search();
  }

  /**
   * Function called when input search is changed
   */
  changed(text: string) {
    if (this.currentFilter === 'all') {
      this.searchTextChanged.next(text);
    } else {
      this.search_box = text;
      this.searchSelected();
    }
  }
  /**
   * Function to get Job Roles
   */
  public getRoles() {
    this.isLoading = true;
    this.jobRoleService.getList()
      .subscribe(roles => {
        this.jobRoles = roles.results;
        this.jobRoles.unshift({
          'id': 0,
          'name': '-'
        });
      });
  }
  /**
   * Function to close current choose worker modal.
   */
  public close() {
    this.dialog.dismiss();
  }
  /**
   * Set parent component ref
   * @param {[type]} ref [reference od parent component object]
   */
  public setComponentRef(ref) {
    this.componentRef = ref;
  }
  /**
   * Function to search workers calling API.
   *
   * @param {event} e [description]
   */
  public search(newSearch?: boolean) {
    if (newSearch && newSearch !== undefined) {
      // Each time the user types a letter the search must be restarted
      this.workers = [];
      this.totalItems = 0;
      this.currentPage = 1;
    }

    if (typeof this.search_box !== undefined) {
      this.isLoading = true;
      this.workerService.searchWorker(this.search_box, { page: this.currentPage, page_size: this.perPage })
        .finally(() => { this.isLoading = false; })
        .subscribe(response => {
            for (let worker of response.workers) {
              worker.role = null;
              if (!!_.find(this.jobData.job_workers, {'worker': worker.id})) {
                worker.selected = true;
              }
              if ((worker.active && !!worker.job_role) || worker.selected)
                this.workers.push(worker);
            }
            this.totalItems = this.workers.length;
          },
          err => { console.error(`ERROR: ${err}`); }
        );
    }
  }
  /**
   * Function to get the worker full name.
   *
   * @param  {any} worker [description]
   * @return {string}     [worker fullname]
   */
  public getFullName(worker: any): string {
    return this.generalFunctions.getContactFullName(worker);
  }
  /**
   * Function triggered when role is changed
   *
   * @param {any} worker [description]
   */
  public roleChange(worker: any, event: any) {
    for (let r of this.jobRoles) {
      if (r.id === event) {
        worker.role = r.id;
        break;
      }
    }
  }
  /**
   * Increase search to currentPage plus one.
   * @param {[type]} $event [description]
   * @param {string} section [section paginator to increase]
   */
  public onScroll() {
    if (this.currentFilter === 'all' && this.currentPage <= Math.floor(this.totalItems / this.perPage)) {
      this.currentPage += 1;
      this.search();
    }
  }
  /**
   * Toggle worker selected
   *
   * @param {Object} worker Worker object.
   */
  public toggleSelected(worker: any) {
    let found = _.find(this.workersToSave, {id: worker.id});
    if (found) {
      _.remove(this.workersToSave, {id: worker.id});
    } else {
      this.workersToSave.push(worker);
    }
    this.selectedItemsCount += worker.selected ? -1 : 1;
    worker.selected = !worker.selected;
  }
  /**
   * Function to reset and close modal.
   */
  public resetAndCloseModal(workerId: number) {
    _.remove(this.workersToSave, (w) => w.id === workerId);
    if (!this.workersToSave.length) {
      this.isLoading = false;
      if (this.openAddEvent) {
        this.componentRef.loadEventsData(this.componentRef);
      }
      this.currentFilter = 'all';
      this.search_box = '';
      this.jobService.get(this.jobData.id).subscribe((jobData) => {
        this.dialog.close(jobData);
      });
    }

  }
  /**
   * Function to add job worker relation.
   */
  public saveJobWorkers(e: any) {
    let method: string;
    let data: {} | number;
    this.isLoading = true;
    for (let worker of this.workersToSave) {
      if (worker.selected) {
        method = 'create';
        data = {
          job: this.jobData.id,
          worker: worker.id,
          roles: worker.role ? [worker.role] : []
        };
      } else {
        method = 'delete';
        data = _.find(this.jobData.job_workers, {'worker': worker.id}).id;
      }
      this.jobWorkerService[method](data)
        .finally(this.resetAndCloseModal.bind(this, worker.id))
        .subscribe(
          () => {},
          err => console.error(`ERROR: ${err}`));
    }
  }

  /**
   * Function to get the worker full name.
   *
   * @param  {string} filter [filter to apply]
   */
  public setFilter(filter: string) {
    this.search_box = '';
    if (filter === 'all') {
      this.currentFilter = 'all';
      this.workers = [];
      this.totalItems = 0;
      this.currentPage = 1;
      this.search();
    } else if (filter === 'selected') {
      this.currentFilter = 'selected';
      this.workers = _.filter(this.workers, {selected: true});
      this.initialWorkers = _.clone(this.workers);
      this.searchSelected();
    } else {
      this.currentFilter = 'new';
    }
  }
  /**
   * Function to search on selected workers
   *
   */
  public searchSelected() {
    let q = this.search_box.trim().toLowerCase();
    if (q.length) {
      this.workers = _.filter(this.initialWorkers, (worker) => {
        let fullname = this.getFullName(worker).toLowerCase();
        return fullname.indexOf(q) > -1;
      });
    } else {
      this.workers = _.clone(this.initialWorkers);
    }
    this.totalItems = this.workers.length;
  }
}
