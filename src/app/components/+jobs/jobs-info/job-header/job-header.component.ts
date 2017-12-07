import {
  Component, EventEmitter, Input, Output, ViewContainerRef
} from '@angular/core';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { overlayConfigFactory } from 'single-angular-modal';
import { Overlay } from 'single-angular-modal/esm';
import { Modal } from 'single-angular-modal/plugins/bootstrap';
import { Event } from '../../../../models/event';
import { Job, JobApiJobContact } from '../../../../models/job';
import { JobRole } from '../../../../models/job-role';
import { JobType } from '../../../../models/job-type';
import { EventService } from '../../../../services/event/';
import { GeneralFunctionsService } from '../../../../services/general-functions';
import { JobRoleService } from '../../../../services/job-role/';
import { JobTypeService } from '../../../../services/job-type/';
import { JobService } from '../../../../services/job/';
import {
  ChooseWorkerComponent,
  ChooseWorkerWindowData
} from '../../../shared/choose-worker/choose-worker.component';
import {
  QuickContractComponent,
  QuickContractWindowData
} from '../../../top-navbar/quick-contract/quick-contract.component';
import { JobHeaderActions } from './job-header-actions';

declare let require: (any);

@Component({
  selector: 'job-header',
  templateUrl: './job-header.component.html',
  styleUrls: ['./job-header.component.scss'],
  providers: [
    EventService, GeneralFunctionsService, JobRoleService, JobService,
    JobTypeService,
  ]
})
export class JobHeaderComponent {
  @Input() job: Job;
  @Input() jobRoles: JobRole[] = [];
  @Input() jobTypes: JobType[] = [];
  @Input() tabs: Array<any> = [];
  @Input() currentTab: any;
  @Output() onTabChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() changeJob = new EventEmitter<void>();
  @Output() changeJobContact = new EventEmitter<JobApiJobContact>();
  @Output() createMessage = new EventEmitter<void>();
  private event = new Event();
  private isLoading: boolean = false;
  private isLoadingPersonnel: boolean = false;
  private initialWidthCalculated: boolean = false;
  private showDropdown: boolean = false;
  private sub: any;
  private jobHeaderActions = JobHeaderActions;
  private eventDate: string = '';
  private dropdownIcon: string = 'icon-down-arrow';
  private modalInstance = null;
  private setEditable: boolean = false;
  private destroyed = new Subject<void>();
  private isOpen: Array<any> = [
    {
      'job_type': false,
      'status': false
    }];
  private onEdit: Array<any> = [
    {
      'job_type': true,
      'status': false
    }];
  private statusLabel: string = '';
  private auxStatus = {
    id: null,
    name: null
  };
  private typeLabel: string = '';
  private auxType = {
    id: null,
    name: null
  };

  constructor (
    private modal: Modal,
    overlay: Overlay,
    vcRef: ViewContainerRef
  ) {
    // This is a workaround for the issue where Modal doesn't work with lazy
    // modules. See http://bit.ly/2qqlpDX for details.
    overlay.defaultViewContainer = vcRef;
  }

  ngOnInit() {
    let url = location.hash.search('modalOpen');
    if (url !== -1) {
      url -= 1;
      location.hash = location.hash.substring(0, url);
    }
    // this.isLoading = true;
    this.initialWidthCalculated = false;
    this.initJob();
  }

  initJob() {
    this.truncateWorkerNames();
    this.formatWorkerRoles();
    this.mapTypeId(this.job.job_type, true);
  }

  ngDoCheck() {
    // call to get width function just once, when all the workers are loaded and the container exists
    if (!this.initialWidthCalculated) {
      if (this.job && this.job.job_workers && this.job.job_workers.length >= 1 && this.job.job_workers.length < 8) {
        this.isLoadingPersonnel = true;
        let container = document.getElementById('personnel-container');
        if (container) {
          this.initialWidthCalculated = true;
          this.getWidth();
          this.isLoadingPersonnel = false;
        }
      }
    }
    let recentlyJob = localStorage.getItem('fromRecentlyCreatedJob');
    if (recentlyJob !== undefined && recentlyJob !== null && recentlyJob === '1') {
      this.setEditable = true;
    } else {
      this.setEditable = false;
    }
  }

  /**
   * Gets width of personnel div, to calculate space between avatars
   */
  public getWidth() {
    if (this.job.job_workers && this.job.job_workers.length >= 1 && this.job.job_workers.length < 8) {
      let section = document.getElementById('section');
      if (section) {
        let availableWidth = section.offsetWidth;

        let container = document.getElementById('personnel-container');
        if (container) {
          // calculate minimum space needed for each worker plus margin-right = 15px
          let width = container.offsetWidth;
          let minPersonnelSpaceWithMargin = (80 * this.job.job_workers.length) + (15 * (this.job.job_workers.length - 1));
          // add 95px from add personnel button (80px) plus margin-right = 15px
          let minSpace = minPersonnelSpaceWithMargin + 95;

          if (minSpace <= availableWidth - 10) {
            // put elements without calculating space because they all fit
            for (let i = 0; i < this.job.job_workers.length; i++) {
              let id = 'personnel-' + i.toString();
              let personnel = document.getElementById(id);
              if (personnel) {
                if (i < (this.job.job_workers.length - 1)) {
                  personnel.style.marginRight = '15px';
                } else {
                  personnel.style.marginRight = '0px';
                }
              }
            }
          } else {
            // calculate free space to resize
            let minPersonnelSpace = 80 * this.job.job_workers.length;
            // subtract 95px from add worker button plus margin-right = 15px
            let cleanSpace = availableWidth - 95 - minPersonnelSpace;
            // add a error margin just in case, because when they fit almost fair, it not work very well
            cleanSpace -= (10 * (this.job.job_workers.length - 1));
            // divide the free space to set margin right on each worker (not the last one)
            let marginRight = (cleanSpace) / (this.job.job_workers.length - 1);
            if (marginRight < -81) {
              marginRight = -81;
            }
            for (let i = 0; i < this.job.job_workers.length; i++) {
              let id = 'personnel-' + i.toString();
              let personnel = document.getElementById(id);
              if (personnel) {
                if (i < (this.job.job_workers.length - 1)) {
                  personnel.style.marginRight = marginRight.toString() + 'px';
                  let avatar = document.getElementById('avatar-' + i.toString());
                  if (avatar) {
                    avatar.style.zIndex = (this.job.job_workers.length - i).toString();
                  }
                } else {
                  personnel.style.marginRight = '0px';
                }
              }
            }
          }
        }
      }
    }
  }

  //noinspection JSUnusedGlobalSymbols
  public onChangePrimaryJobContact() {
    if (!this.job.external_owner) {
      console.warn('The primary contact for the job is not set');
      return;
    }
    let primaryJobContact = this.job.primaryContact ||
      Object.assign(new JobApiJobContact(), {
        contact: this.job.external_owner.id
      });
    this.changeJobContact.emit(primaryJobContact);
  }

  /**
   * Truncate the worker name
   */
  public truncateWorkerNames() {
    for (let worker of this.job.job_workers) {
      worker.name = worker.name.trim();
    }
  }

  /**
   * Format the worker roles
   */
  public formatWorkerRoles() {
    for (let worker of this.job.job_workers) {
      if (worker.roles && worker.roles.length === 1) {
        worker['$formattedRoles'] = worker.roles[0].name;
      } else if (worker.roles) {
        let aux = [];
        for (let role of worker.roles) {
          aux.push(role.name);
        }
        if (aux.length > 0) {
          worker['$formattedRoles'] = _.compact(aux).join(', ');
        }
      }
    }
  }

  /**
   * Return the type name
   * @param {number} optionId [type id]
   * @param {boolean} label [type name must be shown on label]
   */
  public mapTypeId(optionId: number, label?: boolean) {
    for (let i = 0; i < this.jobTypes.length; i++) {
      if (optionId === this.jobTypes[i].id) {
        if (label !== undefined && label) {
          this.typeLabel = this.jobTypes[i].name;
        } else {
          this.auxType.name = this.jobTypes[i].name;
        }
      }
    }
  }

  /**
   * Open/close the dropdown list
   * @param {string} field [dropdown to open]
   */
  public toggleOpen(field: string) {
    this.isOpen[field] = !this.isOpen[field];
    let dropDownContainer = document.getElementById(field + '-container');
    if (dropDownContainer) {
      if (this.isOpen[field]) {
        dropDownContainer.classList.add('open');
        let dropDown = document.getElementById(field + '-list');
        if (dropDown) {
          dropDown.focus();
        }
      } else {
        dropDownContainer.classList.remove('open');
      }
    }
  }

  /**
   * Open new job worker modal
   */
  public addJobWorker() {
    this.modal
      .open(
        ChooseWorkerComponent,
        overlayConfigFactory({jobData: this.job}, ChooseWorkerWindowData)
      )
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            _.assign(this.job, _.pick(result, 'job_workers'));
            this.initJob();
          })
          .catch(() => {});
      });

    // let title = 'Personnel';
    // let style = 'addContactBlock';
    // if (this.modalInstance) {
    //   this.modalInstance.jobData = this.job;
    //   this.modalInstance.search(true);
    // }
    // this.modalService.setModalContent(ChooseWorkerModule, title, style);
    // this.modalService.showModal(false, true);
    // let subscriber = this.modalService.templateChange.subscribe(data => {
    //   this.modalInstance = data.instance;
    //   this.modalInstance.setComponentRef(this);
    //   this.modalInstance.jobData = this.job;
    // });
    // this.modalService.subscribeTemplateChange(subscriber);
  }

  /**
   * Set or close edit header mode
   */
  public toggleEditMode(field: string) {
    if (!this.onEdit[field] && this.typeLabel) {
      this.auxType.name = this.typeLabel;
      this.auxType.id = this.job.job_type;
    }
    if (!this.onEdit[field] && this.statusLabel) {
      this.auxStatus.name = this.statusLabel;
      this.auxStatus.id = this.job.status;
    }
    this.onEdit[field] = !this.onEdit[field];
    // set focus on dropdown button if is on edit mode
    if (this.onEdit[field]) {
      window.setTimeout(() => {
        let button = document.getElementById(field + '-button');
        if (button) {
          button.focus();
        }
      }, 150);
    }
  }

  /**
   * Close the dropdown list
   * @param {string} field [dropdown to close]
   */
  public onDropdownBlur(field: string) {
    window.setTimeout(() => {
        if (this.isOpen[field]) {
          this.toggleOpen(field);
          if (document.activeElement.id !== field + '-list') {
            this.toggleEditMode(field);
          }
        }
      }, 150
    );
  }

  /**
   * Handle tab change
   * @param {number}    idx [new tab index]
   */
  private tabChange(idx: number) {
    this.onTabChange.emit(idx);
    this.currentTab = this.tabs[idx];
  }

  private onChangeJob() {
    this.changeJob.emit();
  }

  /**
   * Create a new contract with for the current job.
   */
  private opentNewContractModal() {
    let data = {'job': this.job};
    this.modal
      .open(QuickContractComponent,
        overlayConfigFactory(data, QuickContractWindowData))
      .then(dialogRef => {
        dialogRef.result
          .then(result => {})
          .catch(() => {});
      });
  }

  //noinspection JSUnusedLocalSymbols
  /**
   * Send a message via email.
   */
  private onCreateMessage() {
    this.createMessage.emit();
  }
}
