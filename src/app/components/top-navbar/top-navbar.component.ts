import {
  Component, EventEmitter, Input, Output, ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { overlayConfigFactory } from 'single-angular-modal';
import { Modal } from 'single-angular-modal/plugins/bootstrap';

import { archivedJobStatus } from '../../models/job';
import { CurrentUser } from '../../models/user';
import { AccessService } from '../../services/access/access.service';
import { ApiService } from '../../services/api/';
import { ContactService } from '../../services/contact/contact.service';
import { GeneralFunctionsService } from '../../services/general-functions';
import { JobTypeService } from '../../services/job-type/';
import { JobService } from '../../services/job/job.service';
import { ModalService } from '../../services/modal/';
import { ContactsUiService } from '../shared/contacts-ui/contacts-ui.service';
import { accountActions, cameraIconActions } from './camera-icon-actions';
import {
  QuickContractComponent, QuickContractWindowData
} from './quick-contract/quick-contract.component';
import {
  QuickJobComponent, QuickJobWindowData
} from './quick-job/quick-job.component';


@Component({
  selector: 'top-navbar',
  templateUrl: 'top-navbar.component.html',
  styleUrls: ['top-navbar.component.scss'],
  providers: [
    ContactService,
    JobService,
    JobTypeService,
    ApiService,
    GeneralFunctionsService,
  ],
  encapsulation: ViewEncapsulation.None
})
export class TopNavbarComponent {
  @Input() sidebarCollapsed: Boolean;
  @Input() sidebarClientAccess: Boolean;
  @Output() toggleSidebar: EventEmitter<Boolean> = new EventEmitter<Boolean>();
  @Output() canDisplay: EventEmitter<Boolean> = new EventEmitter<Boolean>();

  public currentUser: CurrentUser = CurrentUser.Empty;
  public search_box: string;
  public contactResults: any[] = [];
  public jobResults: any[] = [];
  public jobsListSelect: any;
  public perPage: number = 5;
  public isContactLoading: boolean = false;
  public isJobLoading: boolean = false;
  public currentDate: any;
  isMenuCollapsed: boolean = true;
  cameraIconActions = cameraIconActions;
  accountActions = accountActions;

  constructor(public modal: Modal,
              private modalService: ModalService,
              private contactService: ContactService,
              private jobService: JobService,
              private generalFunctions: GeneralFunctionsService,
              private accessService: AccessService,
              private router: Router,
              private contactsUi: ContactsUiService) {
    this.accessService.currentUser$.subscribe(value => this.currentUser = value);
  }

  ngOnInit() {
    this.currentDate = new Date();
  }

  emitToggleSidebar(): void {
    this.toggleSidebar.emit(null);
  }

  /**
   * Execute action function to execute modal function called from Dropdown component.
   * @param {Object} objAction With the object action.
   */
  executeAction(objAction) {
    if (objAction && objAction.action) {
      this[objAction.action]();
    }
  }

  logOut() {
    this.accessService.logout();
    setTimeout(() => {
      this.generalFunctions.navigateTo('/login');
    }, 100);
  }

  /**
   * Open modal with the create quick contact content
   */
  private openCreateQuickContactModal() {
    this.contactsUi.displayAddOrUpdateDialog(ContactService.newObject())
      .subscribe(contact => {
        //noinspection JSIgnoredPromiseFromCall
        this.contactService.create(contact)
          .subscribe(response => {
              this.contactsUi.displaySuccessMessage(
                `The contact ${contact.fullName} has been created`);
              setTimeout(() => {
                this.router.navigate(['/contacts/profile', response.id]);
              }, 300);
            },
            err => {
              console.error(err);
              this.contactsUi.displayErrorMessage(
                'An error has occurred creating the contact, please try again later.'
              );
            }
          );
      });
  }

  /**
   * Open modal with the create quick job
   */
  private createQuickJob() {
    this.modal
      .open(QuickJobComponent, overlayConfigFactory({job: {}}, QuickJobWindowData))
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            setTimeout(() => {
              this.router.navigate(['/jobs', result.id]);
            }, 300);
            // Catching close event with result data from modal
          })
          .catch(() => {
            // Catching dismiss event with no results
          });
      });
  }


  private createQuickContract() {
    this.modal
      .open(QuickContractComponent,
        overlayConfigFactory({}, QuickContractWindowData))
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            // Catching close event with result data from modal
          })
          .catch(() => {
            // Catching dismiss event with no results
          });
      });
  }

  /**
   * [search description]
   * @param {any} e [description]
   */
  private processSearchTerm(searchTerm: any) {
    // 1- Search by entity
    // 2- Get the results
    this.isContactLoading = true;
    this.isJobLoading = true;
    if (searchTerm !== '' && typeof searchTerm !== undefined) {
      this.contactService.searchContact(
        searchTerm, {page_size: this.perPage}
      )
        .subscribe(response => {
            this.contactResults = response.contacts;
          },
          err => {
            console.error(`ERROR: ${err}`);
            this.isContactLoading = false;
          },
          () => {
            this.isContactLoading = false;
          }
        );
      this.jobService.getList({
        search: searchTerm,
        page_size: this.perPage,
        'status!': `${archivedJobStatus}`
      })
        .subscribe(response => {
            this.jobResults = response.jobs;
          },
          err => {
            console.error(`ERROR: ${err}`);
            this.isJobLoading = false;
          },
          () => {
            this.isJobLoading = false;
          }
        );
    }
  }
}
