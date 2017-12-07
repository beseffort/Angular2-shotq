/**
 * Component ContactProfileComponent
 */
import { Component, Inject, ViewContainerRef } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ContactsUiService } from 'app/components/shared/contacts-ui/contacts-ui.service';
import { MessagingUiService } from 'app/components/shared/messaging-ui';
import * as _ from 'lodash';
import { FileUploader } from 'ng2-file-upload';
import { FileItem } from 'ng2-file-upload/components/file-upload/file-item.class';
import { SubscribableOrPromise } from 'rxjs/Observable';
import { Observable } from 'rxjs/Rx';
import { Modal, Overlay, overlayConfigFactory } from 'single-angular-modal/esm';
import { Contact } from '../../../models/contact';
import { ContactNote } from '../../../models/contact-note';
import { BaseNote } from '../../../models/notes';
import { SentCorrespondence } from '../../../models/sentcorrespondence';
import { AccessService } from '../../../services/access';
import { ApiService } from '../../../services/api/';
import { ContactService } from '../../../services/contact';
import { ContactNoteService } from '../../../services/contact-note';
import { EmailTypeService } from '../../../services/email-type';
import { FlashMessageService } from '../../../services/flash-message';
import { GeneralFunctionsService } from '../../../services/general-functions';
import { JobTypeService } from '../../../services/job-type';
import { JobService } from '../../../services/job/job.service';
import { PhoneTypeService } from '../../../services/phone-type';
import { BreadcrumbService } from '../../shared/breadcrumb/components/breadcrumb.service';
import { contactProfileActions } from './contact-profile-actions';
import { ContractService } from '../../../services/contract/contract.service';
import {
  ContractAddModalContext,
  ContractsAddModalComponent
} from '../../+contracts/contracts-add/contracts-add.component';

/* Other variables */
declare let require: any;

@Component({
  selector: 'contact-profile',
  templateUrl: './contact-profile.component.html',
  styleUrls: ['./contact-profile.component.scss'],
  providers: [
    GeneralFunctionsService,
    FlashMessageService,
    ContactService,
    JobService,
    AccessService,
    ContactNoteService,
    EmailTypeService,
    PhoneTypeService,
    ApiService,
    JobTypeService,
  ]
})
export class ContactProfileComponent {
  public isLoading = false;
  public authorized = false;
  public isJobsLoading = false;
  public tabActive = 1;
  public exampleSelect = false;
  public valueSelect = 'Filter';
  public showMore: boolean = false;
  public contactNotes: Array<ContactNote>;
  public categoriesCorrespondence: Array<any> = [
    {
      id: 0,
      name: 'Emails'
    },
    {
      id: 1,
      name: 'Questionnaires'
    }
  ];
  public categories: Array<any> = [
    {
      id: 0,
      name: 'Contracts'
    },
    {
      id: 1,
      name: 'Invoices'
    }
  ];
  private contactQuestionnaires: Array<any> = [
    {
      'date': '2016-12-12T18:53:16.197072',
      'name': 'Fake Questionnaire 3',
      'status': 'Fake Status'
    },
    {
      'date': '2016-12-12T18:53:16.197073',
      'name': 'Fake Questionnaire 4',
      'status': 'Fake Status'
    },
    {
      'date': '2016-12-12T18:53:16.197074',
      'name': 'Fake Questionnaire 5',
      'status': 'Fake Status'
    }
  ];
  private selectedCategoryId: number = 0;
  private oldSelectedCategoryId: number = 0;
  private fileSaver = require('../../../../../node_modules/file-saver/FileSaver.js');
  private alertify = require('../../../assets/theme/assets/vendor/alertify-js/alertify.js');
  private totalItems = 100;
  private perPage = 0;
  private hasPages: boolean = false;
  private subscriber;
  private isSubscribed: boolean;
  private notesLoading: boolean;
  private contactId: any;
  private responseOK: boolean = false;
  private contact: Contact;
  private contactData: any;
  private contactDataFormatted: any;
  private userInfoHeight: string;
  private divHeight: string = '0px';
  private paddingTop: string = '0px';
  private paddingBottom: string = '0px';
  private currentSocials: any;
  private currentUrl: any = undefined;
  private router: Router;
  private birthday: any;
  private anniversary: any;
  private contactJobs: Array<any> = [];
  private listPhones: Array<any> = [];
  private listEmails: Array<any> = [];
  private contactCorrespondence: Array<any> = [];
  private contactContracts: Array<any> = [];
  private contactInvoices: Array<any> = [];
  private contactProfileActions: any = contactProfileActions;
  private dropdownIcon: string = 'icon-down-arrow';
  private dropdownIconEmail: string = 'icon-down-arrow';
  private dropdownIconPhone: string = 'icon-down-arrow';
  private tabSectionName: string = 'jobs';
  private contactFullName: string;
  private checkTable: boolean = true;
  private contractSelectOpened: boolean = false;

  // Sort flags
  private sort = {
    sortedBy: 'date',
    dateCreatedAsc: false,
  };
  /* Notes Paginator */
  private notesPaginator = {
    totalItems: 0,
    currentPage: 1,
    perPage: null,
  };
  private jobsPaginator = {
    totalItems: 0,
    page: 1,
    perPage: 0,
    first: 0,
    last: 0
  };
  private invoicesPaginator = {
    totalItems: 100,
    currentPage: 1,
    perPage: 5,
  };
  private contractsPaginator = {
    totalItems: 100,
    currentPage: 1,
    perPage: 5,
  };
  private actions = {
    color: 'gray',
    enabled: false,
    archiveBtn: {
      message: 'Are you sure that you want to do this?',
    }
  };
  private selectAllChecked: boolean = false;
  private itemsChecked: Array<any> = [];
  private actionsBar = {
    enabled: false,
    deleteBtn: {
      message: 'Are you sure that you want to do this?',
    }
  };
  private paginatorEmails = {
    totalItems: 100,
    currentPage: 1,
    perPage: 5,
  };
  private paginatorQuestionnaires = {
    totalItems: 100,
    currentPage: 1,
    perPage: 5,
  };
  private contactTypeItems: Array<any> = [];
  private contactTypeId: number = 0;
  private contactImage: any;
  private uploader: FileUploader = new FileUploader({});
  private uploaderQueue: Array<FileItem> = [];

  constructor(@Inject(DOCUMENT) private document: Document,
              private presenter: ContactsUiService,
              private generalFunctions: GeneralFunctionsService,
              private flash: FlashMessageService,
              private contactService: ContactService,
              private jobService: JobService,
              private accessService: AccessService,
              private contactNoteService: ContactNoteService,
              private emailTypeService: EmailTypeService,
              private phoneTypeService: PhoneTypeService,
              private messagingUiService: MessagingUiService,
              private modal: Modal,
              private apiService: ApiService,
              private jobTypeService: JobTypeService,
              private breadcrumbService: BreadcrumbService,
              private overlay: Overlay,
              private vcRef: ViewContainerRef,
              _router: Router) {
    this.router = _router;
    this.uploader = new FileUploader({
      url: this.apiService.apiUrl + '/storage/upload/' + this.apiService.auth.id + '/',
      authToken: this.apiService.getOauthAutorization()
    });

    // This is a workaround for the issue where Modal doesn't work with lazy
    // modules. See http://bit.ly/2qqlpDX for details.
    overlay.defaultViewContainer = vcRef;
    this.router = _router;
    breadcrumbService.addFriendlyNameForRouteRegex('^/contacts/profile/[0-9]+', 'Profile');
  }

  public ngOnInit() {
    this.alertify.theme('bootstrap-shootq');
    this.alertify.okBtn('OK');
    let currentUrl = this.generalFunctions.getCurrentUrl();
    this.currentUrl = currentUrl;
    this.contactId = undefined;
    this.contactNotes = [];
    this.contactData = [];
    this.notesPaginator.totalItems = 0;
    this.isSubscribed = false;
    this.notesLoading = false;
    this.responseOK = false;
    this.userInfoHeight = '348px';
    /* Get contact id from url params */
    this.generalFunctions.getUrlParams()
      .subscribe(
        params => {
          if (params['id']) {
            this.contactId = +params['id'];
            if (this.contactId !== undefined && this.contactId !== null) {
              this.getContactInfo();
              this.getContactNotes();
              this.getContactJobs();
              this.getContactCorrespondence();
              this.getContactInvoice();
              this.getContactContract();
              this.contactService.getRequestContactTypes().subscribe(contactTypes => {
                let items = [];
                for (let type of contactTypes) {
                  let aux = {
                    id: type.id,
                    name: type.name,
                    slug: this.generalFunctions.getSlug(type.name)
                  };
                  items.push(aux);
                }
                items.unshift({'id': 0, 'name': 'CONTACT TYPE', slug: 'none'});
                this.contactTypeItems = items;
              });
            }
          }
        },
        console.error.bind(console)
      );
  }

  public ngDoCheck() {
    let cUrl = localStorage.getItem('currentUrl');
    if (this.currentUrl === undefined || this.currentUrl === null || this.currentUrl === '') {
      let currentUrl = this.generalFunctions.getCurrentUrl();
      localStorage.setItem('currentUrl', currentUrl);
    } else if (cUrl === undefined || cUrl === null) {
      localStorage.setItem('currentUrl', this.currentUrl);
    }
    if (this.checkTable) {
      let aux;
      // this.generalFunctions.setTableHeight(document, aux);
      // this.generalFunctions.setTableWidth(document);
    }
  }

  public ngOnDestroy() {
    let currentUrl = this.generalFunctions.getCurrentUrl();
    if (currentUrl !== `/contacts/edit/${this.contactId}`) { // check before delete.
      localStorage.removeItem('currentUrl');
    }
    this.contactId = undefined;
    this.contactNotes = [];
    this.contactData = [];
    this.notesPaginator.totalItems = 0;
    this.isSubscribed = false;
    this.notesLoading = false;
    this.responseOK = false;
  }

  ngAfterViewInit() {
    let $this = this;
    let aux;
    this.generalFunctions.setTableHeight(document, aux);

    // Add handler to recalculate table height when window is resized
    // window.onresize = function() {
    //   $this.generalFunctions.setTableHeight(document, aux);
    //   $this.generalFunctions.setTableWidth(document);
    // };

    // Add scripts to handle the dropdown menu inside the responsive table
    let el: any = document.getElementById('table-container');
    let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    if (w < 768 && el !== null) {
      el.className += ' table-responsive ';
      el.addEventListener('click', function () {
        let dropdown: any = document.querySelector('div.btn-group.no-shadow.open');
        if (dropdown) {
          let options: any = document.querySelector('div.btn-group.no-shadow.open ul.dropdown-menu');
          let divh = options.clientHeight;
          let offset = dropdown.offsetTop;
          // Set the dropdown options position depends on the distance to the table top
          if (offset > divh) {
            options.style.top = 'inherit';
            options.style.bottom = '0';
          } else {
            options.style.top = '0';
            options.style.bottom = 'inherit';
          }
        }
      });
    }
  }

  createContract($event?) {
    if ($event !== undefined) {
      $event.preventDefault();
    }
    this.modal
      .open(ContractsAddModalComponent,
        overlayConfigFactory({
          contract: ContractService.newObject({
            contacts: [this.contactId],
          }),
        }, ContractAddModalContext))
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            // Catching close event with result data from modal
            // console.log(result)
          })
          .catch(() => {
            // Catching dismiss event with no results
            // console.log('rejected')
          });
      });

  }

  /**
   * change tab handler.
   * @param {[type]} index [description]
   */
  public changeTab(index, sectionName?: string) {
    this.tabSectionName = sectionName.replace('_', ' & ');
    if (this.tabSectionName !== undefined) {
      this.breadcrumbService.addFriendlyNameForRouteRegex(
        '^/contacts/profile/[0-9]+',
        `${this.generalFunctions.toTitleCase(this.contactFullName)} > ${this.generalFunctions.toTitleCase(this.tabSectionName)}`
      );
    }
    this.tabActive = index;
    this.totalItems = 100;
    this.perPage = 0;
    this.hasPages = false;
    this.hasPages = this.paginatorHasPages();
    this.itemsChecked = [];
    this.selectAllChecked = false;
    this.oldSelectedCategoryId = 0;
    this.selectedCategoryId = 0;
    this.toggleActionButtonBar();
  }

  /**
   * Function toggleSelect
   * @param {[type]} id [description]
   */
  public toggleSelect(id) {
    this[id] = !this[id];
    this.contractSelectOpened = !this.contractSelectOpened;
  }

  /**
   * Function SelectOption
   * @param {[type]} value [description]
   */
  public selectOption(value) {
    this.valueSelect = value;
    this.exampleSelect = !this.exampleSelect;
  }

  /**
   * Handle actions when see more link is clicked.
   */
  public seeMore() {
    this.showMore = !this.showMore;
    this.divHeight = ((this.showMore) ? '362px' : '0px');
    this.paddingTop = ((this.showMore === true) ? '35px' : '');
    this.paddingBottom = ((this.showMore === true) ? '20px' : '');
    setTimeout(() => {
      this.paddingTop = ((this.showMore === false) ? '0px' : '');
      this.paddingBottom = ((this.showMore === false) ? '0px' : '');
    }, 260);
  }

  public getContactJobs() {
    this.isJobsLoading = true;
    let obserbableArray = [];
    obserbableArray.push(this.jobTypeService.getList());
    obserbableArray.push(this.contactService.getContactJobs(this.contactId));
    Observable.forkJoin(obserbableArray)
      .subscribe((data: any) => {
          if (data.length === 2) {
            this.contactJobs = [];
            if (data[1] && data[1].length > 0) {
              for (let j of data[1]) {
                let aux = {
                  id: j.id,
                  name: j.name,
                  type: undefined,
                  date: j.main_event_date,
                  status: j.status
                };
                for (let type of data[0].results) {
                  if (type.id === j.job_type) {
                    aux.type = type.name;
                    break;
                  }
                }
                this.contactJobs.push(aux);
              }
            }
          }
          this.jobsPaginator.totalItems = this.contactJobs.length;
          this.jobsPaginator.last = this.contactJobs.length;
        },
        err => console.error(err),
        () => this.isJobsLoading = false);
  }

  /**
   * Function to get contact correspondence (Emails).
   */
  public getContactCorrespondence() {
    this.contactService.getContactCorrespondence(this.contactId)
      .subscribe((data: any) => {
        // Convert the response data to the format suitable to use
        // by `CorrespondenceListComponent`.
        // `ContactCorrespondenceSerializer` names `recipients` as `corresponders`,
        // and changes the representation of a recipient to
        // {email_address, first_name, last_name}.
        this.contactCorrespondence = _.map(data, item => {
          return Object.assign(new SentCorrespondence(), item, {
            recipients: _.map(item['corresponders'] || [], o => {
              return {
                recipient_name: [o['first_name'], o['last_name']].join(' '),
                email: o['email']
              };
            })
          });
        });
      });
  }

  /**
   * Function to get contact invoices information.
   */
  public getContactInvoice() {
    this.contactService.getContactInvoices(this.contactId)
      .subscribe((data: any) => {
          this.contactInvoices = data;
        },
        err => console.error(err),
        () => this.isJobsLoading = false);
  }

  /**
   * Function to get contact invoices information.
   */
  public getContactContract() {
    this.contactService.getContactContracts(this.contactId)
      .subscribe((data: any) => {
          this.contactContracts = data;
        },
        err => console.error(err),
        () => this.isJobsLoading = false);
  }

  /**
   * Function to get contact information to present in view.
   */
  public getContactInfo() {
    this.isLoading = true;
    this.contactService.getContact(this.contactId)
      .subscribe(
        contactData => { // Get response from the contact endpoint.
          this.contact = ContactService.newObject(contactData);
          // cache the website name
          this.contact['$websiteDisplayName'] = this.contact.websiteDisplayName;
          this.contact['$websiteUrl'] = this.contact.websiteUrl;
          this.contact['$facebookId'] = this.contact.facebookUserId;
          this.contact['$twitterId'] = this.contact.twitterUserId;
          this.contact['$instagramId'] = this.contact.instagramUserId;
          this.contact['$hasSocialProfiles'] = this.contact.hasSocialProfiles;
          // Format contact data.
          this.authorized = true;
          this.contactDataFormatted = this.contactService.formatContact(contactData);
          this.getSocialNetworksDisabled();
          this.createListPhones();
          this.createListEmails();
          if (contactData['contact_types'].length > 0) {
            this.contactTypeId = contactData['contact_types'][0];
          }

        },
        err => {
          console.error(err);
          if (err.status === 404) {
            this.isLoading = false;
            this.router.navigate(['/not-authorized']);
          } else {
            this.isLoading = false;
            this.router.navigate(['/contacts']);
            this.flash.error('The contact you are trying to access does not exist.');
          }
        },
        () => {
          let aux;
          // this.generalFunctions.setTableHeight(document, aux);
          // this.generalFunctions.setTableWidth(document);
          this.isLoading = false;
          this.userInfoHeight = 'auto';
          /* Set current contact name in breadcrumb */
          this.contactFullName = this.generalFunctions.getContactFullName(this.contactDataFormatted);
          if (this.tabSectionName !== undefined) {
            this.breadcrumbService.addFriendlyNameForRouteRegex(
              '^/contacts/profile/[0-9]+',
              `${this.generalFunctions.toTitleCase(this.contactFullName)} > ${this.generalFunctions.toTitleCase(this.tabSectionName)}`
            );
          } else {
            this.breadcrumbService.addFriendlyNameForRouteRegex(
              '^/contacts/profile/[0-9]+',
              this.generalFunctions.toTitleCase(this.contactFullName)
            );
          }
        }
      );
  }

  onFileChange(event) {
    let hasError;

    if (event.target.files.length === 0) {
      this.uploader.clearQueue();
    }

    hasError = this.validateFiles(event.target.files, event.target.accept);
    if (hasError) {
      this.flash.error('Please make sure you upload valid image file no bigger than 10 MB.');
      return;
    }

    this.isLoading = true;
    for (let fileItem of this.uploader.queue) {
      fileItem.withCredentials = false;
      fileItem.upload();
    }

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      let json = JSON.parse(JSON.parse(response));
      this.contact.avatar = json.file_id;
      this.update(this.contact);
    };
  }

  validateFiles(files: Object[], types: string[], maxsize: number = 10000000): boolean {
    for (let file of files) {
      if (file['size'] > maxsize || types.indexOf(file['type']) === -1)
        return true;
    }
    return false;
  }

  public update(data) {
    this.contactService.update(data)
      .subscribe(response => {
          this.getContactInfo();
          this.presenter.displaySuccessMessage(
            `The contact ${data.fullName} has been changed`);
        },
        err => {
          console.error(err);
          this.presenter.displayErrorMessage(
            'An error has occurred creating the contact, please try again later.'
          );
        }
      );
  }

  /**
   * Handle the paginate pagechange event
   * @param {[type]} e [description]
   */
  private handlePageChange(e) {
    this.perPage = e.perPage;
    this.hasPages = this.paginatorHasPages();
  }

  /**
   * return if the paginator has pages to display or not
   * @return {boolean} [description]
   */
  private paginatorHasPages(): boolean {
    return (this.perPage !== 0 && this.totalItems > this.perPage);
  }

  private jobsPaginatorHandle(e) {
    this.jobsPaginator.perPage = e;
    this.jobsPaginator.page = 1;
    this.jobsPaginator.first = e.perPage * (e.page - 1);
    this.jobsPaginator.last = this.jobsPaginator.first + e.perPage - 1;
  }

  private deleteNotes(notes: ContactNote[]) {
    let requests: SubscribableOrPromise<ContactNote>[] = _(notes)
      .map(item => {
        return this.contactNoteService.delete(item.id);
      })
      .value();
    if (!requests.length)
      return;

    let message = requests.length === 1 ?
      `Do you really want to delete this note from the contact?` :
      `Do you really want to delete ${requests.length} notes from the contact?`;
    this.alertify.confirm(message, () => {
      performDelete.call(this);
    });

    function performDelete() {
      this.isLoading = true;
      Observable.forkJoin(requests)
        .subscribe(() => {
            this.flash.success(requests.length > 1 ?
              'The notes were deleted from the contact' :
              'The note was deleted from the contact');
            this.responseOK = true;
            setTimeout(() => {
              this.getContactNotes();
            });
          },
          err => {
            this.isLoading = false;
            this.responseOK = false;
            console.error(err);
            this.flash.error(requests.length > 1 ?
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
   * Handle notes page change from paginator
   * @param {any} event [event]
   */
  private handlePageChangeNotes(e: any) {
    this.notesPaginator.currentPage = e.currentPage;
    this.notesPaginator.perPage = e.perPage;
    this.getContactNotes();
  }

  /**
   * Function to get contact notes form the API.
   */
  private getContactNotes() {
    this.notesLoading = true;
    if (this.isSubscribed && this.subscriber) {
      this.subscriber.unsubscribe();
    } else {
      this.isSubscribed = true;
    }
    let params = {
      ordering: '-created',
      page_size: this.notesPaginator.perPage,
      page: this.notesPaginator.currentPage
    };
    this.contactNoteService.getListByContact(this.contactId, params)
      .subscribe(
        response => {
          this.contactNotes = response.contactNotes;
          this.getNotesContacts(this.contactNotes);
          this.notesPaginator.totalItems = response.total;
          this.responseOK = true;
        },
        err => {
          console.error(err);
          this.notesLoading = false;
        },
        () => {
          this.notesLoading = false;
        }
      );
  }

  /**
   * Function to get contact full name associated to a note (user profile)
   * by replacing created_by / last_modified_by field on note object.
   * @param {[type]} notes [description]
   */
  private getNotesContacts(notes: Array<ContactNote>) {
    if (notes) {
      for (let note of notes) {
        if (note.created_by !== undefined && note.created_by !== null) {
          this.accessService.getUserProfileInfo()
            .subscribe(
              response => {
                note.created_by = this.generalFunctions.getContactFullName(response);
              },
              console.error.bind(console)
            );
        }
        if (note.last_modified_by !== undefined && note.last_modified_by !== null) {
          this.accessService.getUserProfileInfo()
            .subscribe(
              response => {
                note.last_modified_by = this.generalFunctions.getContactFullName(response);
              },
              console.error.bind(console)
            );
        }
      }
    }
  }

  private saveNote(data: BaseNote) {
    let note = new ContactNote(data.id, data.subject, data.body, this.contactId);
    let isNewObject = !note.id;
    let request = isNewObject ?
      this.contactNoteService.create(note) :
      this.contactNoteService.update(note.id, note);
    request.subscribe(
      response => {
        this.flash.success(
          isNewObject ? 'The note has been created.' : 'The note has been saved.');
        this.responseOK = true;
        setTimeout(() => {
          this.getContactNotes();
        });
      },
      err => {
        console.error(err);
        this.responseOK = false;
        this.flash.error(
          isNewObject ? 'The note could not be created.' : 'The note could not be saved.');
      }
    );
  }

  /**
   * Function to get the first/last name chars.
   */
  private getFullNameFirstChars() {
    if (this.contactDataFormatted !== undefined && this.contactDataFormatted.first_name !== undefined && this.contactDataFormatted.last_name) {
      return this.contactDataFormatted.first_name.charAt(0) + this.contactDataFormatted.last_name.charAt(0);
    }
  }

  /**
   * Function to get the contact full name.
   */
  private getFullName() {
    if (this.contactDataFormatted !== undefined) {
      return this.generalFunctions.getContactFullName(this.contactDataFormatted);
    }
  }

  /**
   * Function to get the contact maiden name.
   */
  private getMaidenName() {
    if (this.contactDataFormatted !== undefined
      && this.contactDataFormatted.maiden_name !== undefined
      && this.contactDataFormatted.maiden_name !== null
      && this.contactDataFormatted.maiden_name !== '') {
      return this.contactDataFormatted.maiden_name;
    } else {
      return '-';
    }
  }

  /**
   * Function to get the contact priamry phone.
   */
  private getPrimaryPhone() {
    if (this.contactDataFormatted !== undefined
      && this.contactDataFormatted.default_phone_details !== undefined
      && this.contactDataFormatted.default_phone_details !== null) {
      return this.generalFunctions.formatPhone(this.contactDataFormatted.default_phone_details.number);
    }
  }

  /**
   * Function to get the contact priamry email.
   */
  private getPrimaryEmail() {
    if (this.contactDataFormatted !== undefined && this.contactDataFormatted.default_email !== undefined) {
      return this.contactDataFormatted.default_email;
    }
  }

  /**
   * Function to get the contact anniversary
   */
  private getAnniversary() {
    if (this.contactDataFormatted !== undefined && this.contactDataFormatted.anniversary !== undefined) {
      this.anniversary = new Date(this.contactDataFormatted.anniversary.toString() + 'T23:59:59Z');
      return true;
    }
    return false;
  }

  /**
   * Function to get the contact birthday
   */
  private getBirthday() {
    if (this.contactDataFormatted !== undefined && this.contactDataFormatted.birthday !== undefined) {
      this.birthday = new Date(this.contactDataFormatted.birthday.toString() + 'T23:59:59Z');
      return true;
    }
    return false;
  }

  /**
   * Function to get the type phone
   */
  private getTypePhone(phone: any) {
    let aux = '';
    if (!phone)
      return;
    if (this.contactDataFormatted && phone.phone_type_details) {
      aux = phone.phone_type_details.name;
    }
    return aux;
  }

  /**
   * Functionto get the requested address field.
   * @param  {string} field [description]
   * @return {string}       [description]
   */
  private getAddressField(field: string): string {
    if (this.contactDataFormatted !== undefined
      && this.contactDataFormatted.default_address[field] !== undefined
      && this.contactDataFormatted.default_address[field] !== null
      && this.contactDataFormatted.default_address[field] !== ''
      && this.contactDataFormatted.default_address[field] !== false) {
      return this.contactDataFormatted.default_address[field];
    } else {
      return '-';
    }
  }

  /**
   * Function to archive contact.
   * @param {number} contactId / The id of the contact that need to be archived.
   */
  private archiveContact(contactId: number) {
    this.alertify.confirm(this.actions.archiveBtn.message, () => {
      this.isLoading = true;
      this.contactService.archiveContact(contactId)
        .subscribe(res => {
            this.flash.success('The contact has been archived.');
            this.generalFunctions.navigateTo('contacts');
          },
          err => {
            console.error(err);
            this.isLoading = false;
            this.flash.error('An error has occurred, the contact cannot be archived, please try again later.');
          },
          () => {
            this.isLoading = false;
          });
    });
  }

  /**
   * ExportVCard function.
   * @param {number} id [description]
   */
  private exportVCard(id: number) {
    this.contactService.exportVCard([id])
      .subscribe(data => {
          this.flash.success('VCard exported correctly.');
          let file = new Blob([data['_body']], {type: 'text/vcard'});
          let filename = `contact-${id}.vcf`;
          this.fileSaver.saveAs(file, filename);
        },
        err => {
          this.flash.error('VCard cannot be exported, please try again later.');
        });
  }

  /**
   * Function to map socials and disable not existent.
   */
  private getSocialNetworksDisabled() {
    if (this.contactDataFormatted !== undefined) {
      this.currentSocials = {
        'facebook': false,
        'twitter': false,
        'instagram': false
      };
      for (let social of this.contactDataFormatted.social_networks) {
        if (social.network !== undefined && social.network !== null) {
          if (social.network === 'website') { // Avoid website as a social network.
            continue;
          } else {
            this.currentSocials[social.network] = true;
          }
        }
      }
    }
  }

  /**
   * Function to get the website information of the contact.
   */
  private getWebsite() {
    if (this.contactDataFormatted !== undefined) {
      return this.contactDataFormatted.website;
    }
  }

  /**
   * Open modal with the create quick job
   */
  private createNewJob(e?: any) {
    let user = null;
    user = this.apiService.getAccount();
    if (user) {
      let data = {
        'name': 'Untitled',
        'account': user,
        'external_owner': this.contactId
      };
      this.jobService.create(data)
        .subscribe(types1 => {
            localStorage.setItem('fromRecentlyCreatedJob', '1');
            this.router.navigate(['/jobs', types1.id]);
            this.flash.success('The job has been created.');
          },
          err => {
            this.flash.error('An error has occurred creating the job, please try again later.');
          });
    } else {
      this.flash.error('An error has occurred creating the job, please try again later.');
    }
  }

  /**
   * Function returns the phone / email type to display
   * @param {string} type [complete name the type]
   */
  private getType(type: string) {
    let typePE: string;
    switch (type) {
      case 'Home':
        typePE = '(H)';
        break;
      case 'Work':
        typePE = '(W)';
        break;
      case 'Mobile':
        typePE = '(M)';
        break;
      default:
        break;
    }
    return typePE;
  }

  /**
   * Function creates a list of phones to display in the dropdown
   */
  private createListPhones() {
    if (this.contactDataFormatted.default_phone_details !== null) {
      let type = this.contactDataFormatted.default_phone_details.phone_type_details ?
        this.contactDataFormatted.default_phone_details.phone_type_details.name : '';
      let phoneDefault = {
        id: this.contactDataFormatted.default_phone_details.id,
        type: this.getType(type),
        type_name: type + ' phone',
        name: this.contactDataFormatted.default_phone_details.number
      };
      this.listPhones.push(phoneDefault);
      for (let p of this.contactDataFormatted.phones) {
        if (p.id !== this.contactDataFormatted.default_phone_details.id) {
          let phone = {
            id: p.id,
            type: this.getType(p.phone_type_details.name),
            type_name: p.phone_type_details ? p.phone_type_details.name : '' + ' phone',
            name: p.number
          };
          this.listPhones.push(phone);
        }
      }
    }
  }

  /**
   * Function creates a list of emails to display in the dropdown
   */
  private createListEmails() {
    if (this.contactDataFormatted.default_email_details !== null) {
      let emailDefault = {
        id: this.contactDataFormatted.default_email_details.id,
        type: this.getType(this.contactDataFormatted.default_email_details.email_type_details.name),
        type_name: this.contactDataFormatted.default_email_details.email_type_details.name + ' email',
        name: this.contactDataFormatted.default_email_details.address
      };
      this.listEmails.push(emailDefault);
      for (let e of this.contactDataFormatted.emails) {
        if (e.id !== this.contactDataFormatted.default_email_details.id) {
          let email = {
            id: e.id,
            type: this.getType(e.email_type_details.name),
            type_name: e.email_type_details.name + ' email',
            name: e.address
          };
          this.listEmails.push(email);
        }
      }
    }
  }

  /**
   * Function to execute action coming from dropdown.
   */
  private executeAction(data: any) {
    switch (data.id) {
      case 'contract':
        this.createContract();
        break;
      case 'job':
        this.createNewJob();
        break;
      case 'proposal':
        this.router.navigateByUrl('jobs/1/proposal'); // Temporary link to proposals page.
        break;
      default:
        break;
    }
  }

  /**
   * Function to change arrow icon on open or close dropdown event.
   *
   * @param {any} e [description]
   */
  private openCloseEvHandler(e: any, entity?: string) {
    if (e === 'opened') {
      if (entity === 'email') {
        this.dropdownIconEmail = 'icon-up-arrow';
      } else if (entity === 'phone') {
        this.dropdownIconPhone = 'icon-up-arrow';
      } else {
        this.dropdownIcon = 'icon-up-arrow';
      }
    } else {
      if (entity === 'email') {
        this.dropdownIconEmail = 'icon-down-arrow';
      } else if (entity === 'phone') {
        this.dropdownIconPhone = 'icon-down-arrow';
      } else {
        this.dropdownIcon = 'icon-down-arrow';
      }
    }
  }

  /**
   * Function that sets the string of contacts to which the email is sent
   */
  private getCorresponders(corresponders: any) {
    let names = corresponders[0].first_name + ' ' + corresponders[0].last_name;
    for (let i = 1; i < corresponders.length; i++) {
      names += ', ';
      names += corresponders[i].first_name + ' ' + corresponders[i].last_name;
    }
    return names;
  }

  //noinspection JSUnusedLocalSymbols
  private onDisplayMessage(message: SentCorrespondence) {
    this.messagingUiService.displayViewMessageDialog(message).subscribe();
  }


  // <editor-fold desc="Item selection management">
  /**
   * Check if given item is checked
   * @param {[type]}
   */
  private isChecked(item) {
    return (this.itemsChecked.indexOf(item.id) !== -1);
  }

  /**
   * Toogle the item selected status
   * @param {[Contact]}
   */
  private toggleCheck(item, name: string) {
    if (!this.isChecked(item)) {
      this.checkItem(item, name);
    } else {
      this.uncheckItem(item);
    }
    this.toggleActionButtonBar();
  }

  /**
   * Check an item
   * @param {[type]}
   */
  private checkItem(item, name: string) {
    let count;
    switch (name) {
      case 'Invoices':
        count = this.contactInvoices.length;
        break;
      case 'Contracts':
        count = this.contactContracts.length;
        break;
      case 'Correspondence':
        count = this.contactCorrespondence.length;
        break;
      case 'Questionnaires':
        count = this.contactQuestionnaires.length;
        break;
      default:
        break;
    }
    this.itemsChecked.push(item.id);
    if (this.itemsChecked.length === count) {
      this.selectAllChecked = true;
    } else {
      this.selectAllChecked = false;
    }
  }

  /**
   * Uncheck an item
   * @param {[type]}
   */
  private uncheckItem(item) {
    let i = this.itemsChecked.indexOf(item.id);
    this.itemsChecked.splice(i, 1);
    this.selectAllChecked = false;
  }

  /**
   * toogle enabled/disabled status of the action button bar
   */
  private toggleActionButtonBar() {
    if (this.itemsChecked.length > 0) {
      this.actionsBar.enabled = true;
    } else {
      this.actionsBar.enabled = false;
    }
  }

  /**
   * Check all the contacts
   */
  private checkAll(name: string) {
    this.selectAllChecked = !this.selectAllChecked;
    this.itemsChecked.splice(0);
    if (this.selectAllChecked) {
      switch (name) {
        case 'Invoices':
          for (let item of this.contactInvoices) {
            this.checkItem(item, name);
          }
          break;
        case 'Contracts':
          for (let item of this.contactContracts) {
            this.checkItem(item, name);
          }
          break;
        case 'Correspondence':
          for (let item of this.contactCorrespondence) {
            this.checkItem(item, name);
          }
          break;
        case 'Questionnaires':
          for (let item of this.contactQuestionnaires) {
            this.checkItem(item, name);
          }
          break;
        default:
          break;
      }
    }
    this.toggleActionButtonBar();
  }

  // </editor-fold>


  /**
   * Change category in menu(contract/invoices or email/questionnaries)
   */
  private changeCategory(e: any) {
    if (this.oldSelectedCategoryId !== this.selectedCategoryId) {
      this.oldSelectedCategoryId = this.selectedCategoryId;
      this.itemsChecked = [];
    }
  }

  //noinspection JSUnusedLocalSymbols
  /**
   * Opens the edit contact modal dialog
   */
  private editContact() {
    this.presenter.displayAddOrUpdateDialog(this.contact)
      .subscribe(changedContact => {
        this.isLoading = true;
        //noinspection JSIgnoredPromiseFromCall
        this.update(changedContact);
      });
  }

  /**
   * Change the contact type id
   * @param {[type]} id [description]
   */
  private setContactType(id) {
    this.contactTypeId = id;
    this.isLoading = true;
    let minData = {
      'id': this.contactId,
      'contact_types': [this.contactTypeId]
    };
    this.contactService.update(minData)
      .subscribe(data => {
          this.flash.success('The contact has been updated.');
        },
        err => {
          this.flash.error('An error has occurred updating the contact, please try again later.');
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  /**
   * Handle event emited to associate the saved image file to the item
   * @param {any} e [description]
   */
  private associateSavedImage(e: any) {

  }

}
