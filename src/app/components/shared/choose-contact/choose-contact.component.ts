/**
 * Component ChooseContactComponent
 */
import { Component } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';

import * as _ from 'lodash';
import { DialogRef, ModalComponent } from 'single-angular-modal';
import { BSModalContext } from 'single-angular-modal/plugins/bootstrap';

import { ContactService }           from '../../../services/contact';
import { JobService }               from '../../../services/job';
import { JobContactService }        from '../../../services/job-contact';
import { JobRoleService }           from '../../../services/job-role';
import { GeneralFunctionsService }  from '../../../services/general-functions';
import { FlashMessageService }      from '../../../services/flash-message';
import { Job, JobApiJobContact } from '../../../models/job';
import { Observable } from 'rxjs';
import { Contact } from '../../../models/contact';
import { ArrayFilterPipe } from '../../../pipes/array-filter/array-filter.pipe';


export class ChooseContactWindowData extends BSModalContext {
  jobId: number;
}


@Component({
  selector: 'choose-contact',
  templateUrl: 'choose-contact.component.html',
  styleUrls: ['choose-contact.component.scss'],
  providers: [ContactService, JobContactService, GeneralFunctionsService,
    FlashMessageService, JobRoleService, JobService, ArrayFilterPipe]
})
export class ChooseContactComponent implements ModalComponent<ChooseContactWindowData> {
  searchTextChanged: Subject<string> = new Subject<string>();

  jobData = new Job;
  jobId: number;
  public _ = require('../../../../../node_modules/lodash');

  private alertify = require('../../../assets/theme/assets/vendor/alertify-js/alertify.js');
  private search_box: string;
  private limit: number = 10;
  private submitDisabled: boolean = true;
  private orderBy: string;
  private orderDirection: string;
  private currentFilter: string = 'all';
  private totalItems: number = 0;
  private currentPage: number = 1;
  private perPage: number = 10;
  private isLoading: boolean = false;
  private contacts: Array<any> = [];
  private selectedContacts: Array<any> = [];
  private jobRoles: Array<any> = [];
  private contactsToAddIds: Array<number> = [];
  private contactsToRemoveIds: Array<number> = [];
  private newName: string = null;
  private newLastName: string = null;
  private newEmail: string = null;
  private newRole: number;
  private newChecked: boolean = false;
  private currentUrl: string = null;
  private showNewContactRow: boolean = false;
  private addContactFlag = false;

  constructor(
    private contactService: ContactService,
    private jobContactService: JobContactService,
    private jobRoleService: JobRoleService,
    private jobService: JobService,
    private flash: FlashMessageService,
    public router: Router,
    public filterPipe: ArrayFilterPipe,
    public dialog: DialogRef<ChooseContactWindowData>
    ) {
    this.currentUrl = this.router.url;
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
    this.jobId = this.dialog.context['jobId'];
    this.loadJobData(this.jobId);

    this.alertify.theme('bootstrap-shootq');
    this.alertify.okBtn('OK');
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

  public loadJobData(id: number) {
    this.jobId = id;
    this.isLoading = true;
    this.jobService.get(this.jobId)
      .subscribe((data: Job) => {
        this.jobData = JobService.newObject(data);
        this.getRoles();
        this.search(true, true);
      }, err => console.error(err), () => {});
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
          'name': 'Job Role...'
        });
      });
  }
  /**
   * Function to close current choose contact modal.
   */
  public modalClose() {
    this.dialog.close();
    this.contactsToAddIds = [];
    this.contactsToRemoveIds = [];
    this.search_box = '';
    this.currentFilter = 'all';
  }

  /**
   * Function to search contacts calling API.
   *
   * @param {event} e [description]
   */
  public search(newSearch?: boolean, firstSearch?: boolean) {
    if (newSearch) {
      // Each time the user types a letter the search must be restarted
      this.contacts = [];
      this.totalItems = 0;
      this.currentPage = 1;
    }

    if (this.search_box === undefined)
      return;

    this.isLoading = true;
    this.contactService
      .searchContact(this.search_box, {
        archived: 'False',
        active: 'True',
        page: this.currentPage,
        page_size: this.perPage
      })
      .subscribe(
        response => {
          // add search result contacts to contact list
          this.contacts = response.contacts;
          for (let contact of this.contacts) {
            let assocJobContact = _.find(this.jobData.job_contacts, {contact: contact.id});
            if (assocJobContact ||
              this.contactsToAddIds.indexOf(contact.id) !== -1)
              contact.selected = true;

            // Set roles
            contact.role = 0;
            if (assocJobContact && assocJobContact.roles.length > 0)
                contact.role = assocJobContact.roles[0].id;
          }
          this.totalItems = this.contacts.length;
          if (firstSearch)
            this.selectedContacts = _.filter(this.contacts, {selected: true});
        },
        err => { console.error(err); },
        () => { this.isLoading = false; }
      );
  }
  /**
   * Function triggered when role is changed
   *
   * @param {any} contact [description]
   */
  public roleChange(contact: any, event: any) {
    for (let r of this.jobRoles) {
      if (r.id === event) {
        contact.role = r.id;
        break;
      }
    }
  }
  public newRoleChange(event: any) {
    for (let r of this.jobRoles) {
      if (r.id === event) {
        this.newRole = r.id;
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
    if (this.currentFilter === 'all' && this.currentPage < Math.floor(this.totalItems / this.perPage)) {
      this.currentPage += 1;
      this.search();
    }
  }
  /**
   * Set contact selected
   *
   * @param {Object} contact Contact object.
   */
  public setSelected(contact: any) {
    let inJobContacts = _.findIndex(this.jobData.job_contacts, {contact: contact.id}) !== -1;

    this.submitDisabled = false;
    if (contact.selected) {
      // If it's already added - do nothing
      if (inJobContacts)
        return;
      // Add id to array - to save then
      this.contactsToAddIds.push(contact.id);
      this.selectedContacts.push(contact);
      return;
    }

    if (_.includes(this.contactsToAddIds, contact.id))
      _.pull(this.contactsToAddIds, contact.id);
    if (inJobContacts)
      this.contactsToRemoveIds.push(contact.id);
    _.remove(this.selectedContacts, {id: contact.id});
  }

  /**
   * Function to add job contact relation.
   */
  public save() {
    let primary = this.jobData.primaryContact,
      validated = this.validate(),
      $subAddContacts = [], $subRemoveContacts = [];

    if (!validated)
      return;

    this.isLoading = true;

    for (let contactId of this.contactsToAddIds) {
      let contact = _.find(this.contacts, {id: contactId});
      $subAddContacts.push(this.addContact(contact));
    }

    for (let contactId of this.contactsToRemoveIds) {
      $subRemoveContacts.push(this.removeContact(contactId));
    }

    Observable
      .zip(...$subAddContacts, ...$subRemoveContacts)
      .subscribe(
        (jobContacts: JobApiJobContact[]) => {
          this.jobData.job_contacts.concat(jobContacts);
          this.setPrimary(jobContacts[0].contact);
          this.modalClose();
        },
        err => {
          console.error(err);
          this.isLoading = false;
        },
        () => { this.isLoading = false; }
      );
  }

  public setPrimary(contact) {
    if (this.jobData.primaryContact)
      return;

    this.jobService
      .partialUpdate(this.jobData.id, {
        external_owner: contact
      })
      .subscribe(
        () => {},
        err => console.error(err),
        () => {
          this.isLoading = false;
          this.modalClose();
        }
      );
  }

  public validate() {
    let primaryContact = this.jobData.primaryContact,
      validated = true;

    if (primaryContact && _.includes(this.contactsToRemoveIds, primaryContact.id)) {
      this.flash.error('Can\'t delete primary job contact.');
      validated = false;
    }

    for (let contactId of this.contactsToAddIds) {
      let contact = _.find(this.contacts, {id: contactId});
      if (!contact.role) {
        this.flash.error(`Can\'t add ${contact.full_name} to the job. Job role is required.`);
        validated = false;
      }
    }

    return validated;
  }

  public addContact(contact) {
    return this.jobContactService
      .create({
        job: this.jobData.id,
        contact: contact.id,
        roles: [contact.role]
      });
  }

  public removeContact(contactId) {
    let jobContact = _.find(this.jobData.job_contacts, {contact: contactId}),
      contact = _.find(this.contacts, {id: contactId});

    contact.selected = false;
    if (!jobContact) {
      _.pull(this.contactsToRemoveIds, contact.id);
      return;
    }

    return this.jobContactService.delete(jobContact.id);
  }

  /**
   * Function to get the contact email.
   *
   * @param  {Contact} contact [description]
   * @return {string}          [description]
   */
  public getEmail(contact: any): string {
    if (contact.isJobContact) {
      return contact.default_email_address;
    } else if (contact.emails && contact.emails.length > 0) {
      return contact.emails[0].address;
    } else {
      return '';
    }
  }
  /**
   * Function to cut the text to enter on the available space
   *
   */
  public checkLength(text: string, type: string) {
    if (type === 'name') {
      return text.slice(0, 20) + '...';
    } else {
      return text.slice(0, 17) + '...';
    }
  }
  /**
   * Function to get the contact full name.
   *
   * @param  {string} filter [filter to apply]
   */
  public setFilter(filter: string) {
    if (this.showNewContactRow && !this.addContactFlag) {
      let $this = this;
      let message = 'The contact is not saved yet. Do you want to continue?';
      this.alertify.confirm(message, () => {
        $this.cancelAddNew();
        $this.setFilter(filter);
      });
    } else {
      this.search_box = '';
      if (filter === 'all') {
        this.currentFilter = 'all';
        this.totalItems = 0;
        this.currentPage = 1;
        this.search();
      } else if (filter === 'selected') {
        this.currentFilter = 'selected';
        this.searchSelected();
      }
    }
    if (this.addContactFlag) {
      this.cancelAddNew();
      this.addContactFlag = false;
    }

  }
  /**
   * Function to search on selected contacts
   *
   */
  public searchSelected() {
    let searchTerm = this.search_box.trim();
    this.contacts = _.filter(this.contacts, {selected: true});
    if (searchTerm)
      this.contacts = this.filterPipe.transform(this.contacts, {full_name: searchTerm});
    else
      this.contacts = this.selectedContacts;
    this.totalItems = this.contacts.length;
  }

  /**
   * Function to set the new contact as selected when is created
   *
   */
  public setNewSelected() {
    this.newChecked = !this.newChecked;
  }
  /**
   * Function to add new contact
   *
   */
  public addNewContact() {
    this.addContactFlag = true;
    let hasErrors = false;
    if (this.newRole === undefined || this.newRole === 0) {
      this.flash.error('You must select a role.');
      hasErrors = true;
    }
    if (this.newEmail !== undefined && !this.validateEmail(this.newEmail)) {
      hasErrors = true;
    }
    if (this.newName !== undefined && !this.validateLetters(this.newName, 'name')) {
      hasErrors = true;
    }
    if (this.newLastName !== undefined && !this.validateLetters(this.newLastName, 'last name')) {
      hasErrors = true;
    }
    if (hasErrors) {
      return;
    }
    let newContact = {
      'first_name': this.newName.toLowerCase(),
      'last_name': this.newLastName.toLowerCase(),
      'account': 1,
      'emails': [{
        'address': this.newEmail,
        'email_type': 1
      }]
    };
    this.isLoading = true;
    this.contactService.create(newContact)
      .subscribe(contactData => {
          contactData.role = this.newRole;
          // Add contact to Job
          this.addContact(contactData)
            .subscribe(
              (data) => {
                this.setPrimary(contactData);
                this.jobData.job_contacts.push(
                  Object.assign(new JobApiJobContact(), data)
                );
              },
              (error) => {
                console.error(error);
                this.flash.error('An error has occurred adding the contact' +
                  ' to Job, please try again later.');
                this.contactsToAddIds.push(contactData.id);
              },
              () => { this.setFilter('all'); }
            );
          this.flash.success('The contact has been created.');
        },
        err => {
          this.flash.error('An error has occurred creating the contact, please try again later.');
        },
        () => {}
      );
  }

  /**
   * Add new contact event handler
   * display the new contact row
   */
  private addNewContactRow() {
    if (!this.showNewContactRow) {
      let el: any = document.querySelector('.list-group.list-group-full');
      if (el !== undefined) {
        el.scrollTop = 0;
      }
      this.newName = undefined;
      this.newRole = undefined;
      this.newLastName = undefined;
      this.newEmail = undefined;
      this.showNewContactRow = true;
    }
  }

  /**
   * Cancel add new contact event
   * Hide the add new contact row
   * and restart the new contact variables
   */
  private cancelAddNew() {
    this.showNewContactRow = false;
    this.newName = undefined;
    this.newRole = undefined;
    this.newLastName = undefined;
    this.newEmail = undefined;
  }

  /**
   * Validate email format
   * Alert user with flash message if email isn't valid
   * @param {string} email [description]
   */
  private validateEmail(email: string) {
    if (!email.match('[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)' +
      '+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)')) {
      this.flash.error('Please, enter a valid Email');
      return false;
    } else {
      return true;
    }
  }

  /**
   * Validate that the string passed has only letters
   * if it doesn't, display a flash error and use the label parameter
   * to alert user
   * @param {string} value [description]
   * @param {string} label [description]
   */
  private validateLetters(value: string, label: string) {
    let exp = new RegExp(/^[A-zÀ-úA-zÀ-ÿ\s\']*$/g);
    if (!exp.test(value)) {
      this.flash.error('Please, enter a valid ' + label);
      return false;
    } else {
      return true;
    }
  }

}
