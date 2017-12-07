import { Component, Inject, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/platform-browser';

import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Overlay, overlayConfigFactory } from 'single-angular-modal/esm';
import { Modal } from 'single-angular-modal/plugins/bootstrap';

import { ContactService } from '../../../services/contact/contact.service';
import { GeneralFunctionsService } from '../../../services/general-functions';
import { ModalService } from '../../../services/modal/';
import { BreadcrumbService } from '../../shared/breadcrumb/components/breadcrumb.service';
import { Contact } from '../../../models/contact';
import {
  BulkEnableActions, ContactTypeActions, ExportActions, NewContactButton, SingleActions
} from './menu-items';
import { CapitalizePipe } from '../../../pipes/capitalize/capitalize.pipe';
import { ContactPageCursor, ContactsUiService } from '../../shared/contacts-ui/contacts-ui.service';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';
import { DeleteCategoriesWindowData } from '../../+settings/base-product-list/manage-categories/delete-categories/delete-categories.component';
import { ContactDeleteModalComponent, ContactDeleteWindowData } from './contact-delete/contact-delete-modal.component';

declare let require: (any);


@Component({
  selector: 'app-contacts',
  templateUrl: './contacts-list.component.html',
  styleUrls: ['./contacts-list.component.scss'],
  providers: [CapitalizePipe, GeneralFunctionsService]
})
export class ContactsListComponent implements OnInit {
  public isArchived: boolean = false;

  private subscription;
  private fileSaver = require('../../../../../node_modules/file-saver/FileSaver.js');
  private router:                       Router;
  /* Contacts list */
  private contacts: Contact[] = [];
  /* Array with contacts id of those contacts that are checked */
  private contactsChecked:              Array<any> = [];
  private selectAllChecked:             boolean = false;
  private twoNotSelected:               boolean = true;
  private contactMerge:                 any = {id1: '', id2: ''};
  private bulkEnableActions             = BulkEnableActions;
  private singleActions                 = SingleActions;
  private contactTypeActions            = ContactTypeActions;
  private newContactButton              = NewContactButton;
  private exportActions                 = ExportActions;
  private filterParams:                 string;
  private generalFunctions:             any;
  private isLoading:                    boolean = false;
  private searchTerm:                   string;
  private searching:                    boolean;
  private areUSureMsg:                  string = 'Are you sure that you want to perform this action?';
  private hasPages:                     boolean = false;
  private contactTypes:                 any;
  private scroll:                       boolean = false;
  private contactTypeFilter:            string = 'all';
  private dropdownOpenedClass:          string;
  /** @type {Object} Action bar style configuration object */
  private actionsBar = {
    color: 'gray',
    enabled: false,
    deleteBtn: {
      message: 'Are you sure that you want to archive the contact?',
    }
  };
  // sort flags
  private sort = {
    sortedBy: 'name',
    nameAsc: true,
    dateCreatedAsc: true,
    emailAsc: true
  };

  private icons = {
    nameUp: 'icon-up-arrow',
    nameDown: 'icon-down-arrow',
    dateUp: 'icon fa-sort-amount-asc',
    dateDown: 'icon fa-sort-amount-desc',
    emailUp: 'icon-up-arrow',
    emailDown: 'icon-down-arrow'
  };

  private paginator = {
    totalItems: 100,
    currentPage: 1,
    perPage: 0,
  };

  constructor(@Inject(DOCUMENT) private document: Document,
              private presenter: ContactsUiService,
              generalFunctions: GeneralFunctionsService,
              _router: Router,
              private breadcrumbService: BreadcrumbService,
              private contactService: ContactService,
              private modalService: ModalService,
              overlay: Overlay,
              vcRef: ViewContainerRef,
              private capitalizePipe: CapitalizePipe,
              private modal: Modal,
              private flash: FlashMessageService) {
    this.generalFunctions = generalFunctions;
    // This is a workaround for the issue where Modal doesn't work with lazy
    // modules. See http://bit.ly/2qqlpDX for details.
    overlay.defaultViewContainer = vcRef;
    this.router = _router;
    breadcrumbService.addFriendlyNameForRoute('/contacts', 'Contacts');
  }

  /**
   * OnInit Angular Hook.
   */
  ngOnInit() {
    /* Temporary fix for location on app reload and modal still open. */
   if (location.hash.search('modalOpen') > -1) {
     location.hash = location.hash.replace('?modalOpen', '');
   }
    let body: any = this.document.getElementsByTagName('body')[0];
    body.style['overflow-y'] = 'auto';
    this.modalService.setParentRef(this);

    let subscription = Observable.zip(this.presenter.contactTypes$, this.presenter.masterContent$)
      .subscribe(data => {
        this.contactTypes = data[0];
        this.setViewValue(data[1]);
        this.subscription = this.presenter.masterContent$.subscribe(this.setViewValue.bind(this));
        subscription.unsubscribe();
      });

    this.getContacts();
  }

  /**
   * OnDestroy Angular Hook.
   */
  ngOnDestroy() {
    if (this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }
    this.modalService.removeParentRef();
  }
  /**
   * AfterViewInit Angular Hook.
   */
  ngAfterViewInit() {
    let $this = this;
    // Add handler to recalculate table height when window is resized
    window.onresize = function () {
      $this.setTableWidth();
    };

    // Add scroll event handler
    let tableBody: any = this.document.querySelector('#table-container table tbody');
    let tableHeader: any = this.document.querySelector('table.scroll thead');
    // Add scripts to handle the dropdown menu inside the responsive table
    let el: any = document.getElementById('table-container');
    let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    if (w < 768) {
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

  /**
   * Function to navigate to url.
   * Optional you can pass ids as params.
   * @param {string} param url to navigate to.
   */
  public navigateTo(url, params = {}) {
    this.generalFunctions.navigateTo(url, params);
  }

  public getContacts() {
    let o = this.generalFunctions.getSortOrderParam(this.sort);
    // let p = this.generalFunctions.getPaginatorParam(this.paginator);
    // let f = this.filterParams;
    let contactMissing = this.paginator.perPage * this.paginator.currentPage - this.paginator.totalItems;
    if (contactMissing >= this.paginator.perPage) {
      this.paginator.currentPage -= 1;
    }
    let params = {
      archived: this.isArchived,
      active: true,
      page: this.paginator.currentPage,
      page_size: this.paginator.perPage,
      ordering: o.split('=')[1]
    };
    let searchTerm = (this.searchTerm || '').trim();
    if (searchTerm)
      params['search'] = searchTerm;

    this.isLoading = true;
    this.presenter.fetch(params);
  }

  toggleView() {
    this.isArchived = !this.isArchived;
    this.getContacts();
  }

  confirmRestore() {
    this.modal
      .confirm()
      .isBlocking(true)
      .showClose(false)
      .title('Restore contacts?')
      .dialogClass('modal-dialog modal-confirm')
      .body('Are you sure you want to restore selected contacts?')
      .okBtn('Restore')
      .okBtnClass('btn btn_xs btn_blue pull-right')
      .cancelBtnClass('btn btn_xs btn_transparent')
      .open()
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            this.updateSelected(this.getCheckedContacts(), {archived: false});
          })
          .catch(() => {});
      });
  }

  confirmDelete() {
    let checkedContacts = this.getCheckedContacts();
    this.modal
      .open(ContactDeleteModalComponent, overlayConfigFactory({
        contacts: checkedContacts
      }, ContactDeleteWindowData))
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            let toUpdate = _.filter(checkedContacts, {has_relations: false});
            this.updateSelected(toUpdate, {active: false});
          })
          .catch(() => {
          });
      });
  }

  public getCheckedContacts() {
    return _.filter(this.contacts, (c) => {
      return _.includes(this.contactsChecked, c.id);
    });
  }

  public updateSelected(contacts, data) {
    if (!contacts.length)
      return;

    this.isLoading = true;
    let updateData = _.map(contacts, (c) => {
      return Object.assign({id: c['id']}, data);
    });
    this.contactService
      .bulkPatch(updateData)
      .subscribe(
        () => {
          this.flash.success('Contacts are successfully updated.');
          this.getContacts();
        },
        (error) => {
          console.error(JSON.stringify(error));
          this.flash.error('Error while updating contacts.');
          this.isLoading = false;
        }
      );
  }

  private setViewValue(pageCursor: ContactPageCursor) {
      this.contacts = _.map(pageCursor.results, item => {
        // item['$default_address'] = this.contactService.getDefaultAddress(item);
        item['$default_email'] = item.defaultEmail;
        item['$default_phone'] = this.generalFunctions.formatPhone(item.defaultPhoneNumber);
        item['$fullName'] = item.fullName;
        item['$contactTypes'] = _.map(item.contact_types, id => _.find(this.contactTypes, ['id', id]));
        item['$contactTypesString'] = _.map(item['$contactTypes'], 'name').join(', ');
        item['$type'] = item.contact_types.join(', ');
        return item;
      });
      this.isLoading = false;
      this.paginator.totalItems = pageCursor.count;
      this.contactMerge = {id1: '', id2: ''};
      this.contactsChecked = [];
      this.selectAllChecked = false;
      this.actionsBar.enabled = false;
      setTimeout(() => {
        this.setTableWidth();
      });
  }

  /**
   * return the contact img path, if is null or undefined return the default avatar
   * @param  {Object}
   * @return {string}
   */
  private getContactImg(contact: Contact): string {
    if (contact.img !== undefined && contact.img !== null) {
      return contact.img;
    } else {
      return 'assets/img/avatar.png';
    }
  }

  /**
   * [getContactFullName description]
   * @param {[type]} contact [description]
   */
  private getContactFullName(contact) {
    return `${contact.first_name} ${contact.last_name}`;
  }
  /**
   * Check all the contacts
   */

  private checkAll() {
    this.selectAllChecked = !this.selectAllChecked;
    this.contactsChecked.splice(0);
    if (this.selectAllChecked) {
      for (let c of this.contacts) {
        this.checkContact(c);
      }
    }
    this.twoNotSelected = ((this.contactsChecked.length === 2) ? false : true);
    this.toggleActionButtonBar();
  }

  /**
   * Toogle the checked status of a contact
   * @param {[Contact]}
   */
  private toggleCheckContact(contact) {
    if (!this.isChecked(contact)) {
      this.checkContact(contact);
    } else {
      this.uncheckContact(contact);
    }
    this.toggleActionButtonBar();
  }

  /**
   * Uncheck a contact
   * @param {[type]}
   */
  private uncheckContact(contact) {
    let i = this.contactsChecked.indexOf(contact.id);
    this.contactsChecked.splice(i, 1);
    this.selectAllChecked = false;
    this.twoNotSelected = ((this.contactsChecked.length === 2) ? false : true);
  }

  /**
   * Check a contact
   * @param {[type]}
   */
  private checkContact(contact) {
    this.contactsChecked.push(contact.id);
    if (this.contactsChecked.length === this.contacts.length) {
      this.selectAllChecked = true;
    }
    this.twoNotSelected = ((this.contactsChecked.length === 2) ? false : true);
    if (this.contactsChecked.length === 1) {
      this.contactMerge.id1 = contact.id;
    } else if (this.contactsChecked.length === 2) {
      this.contactMerge.id2 = contact.id;
    }
  }

  /**
   * toogle enabled/disabled status of the action button bar
   */
  private toggleActionButtonBar() {
    if (this.contactsChecked.length > 0) {
      this.actionsBar.enabled = true;
    } else {
      this.actionsBar.enabled = false;
    }
  }

  /**
   * return if a contact is checked
   * @param {[type]}
   */
  private isChecked(contact) {
    return (this.contactsChecked.indexOf(contact.id) !== -1);
  }

  //noinspection JSUnusedLocalSymbols
  private addContact() {
    this.presenter.displayAddOrUpdateDialog(ContactService.newObject())
      .subscribe(contact => {
        this.isLoading = true;
        //noinspection JSIgnoredPromiseFromCall
        this.contactService.create(contact)
          .finally(() => this.isLoading = false)
          .subscribe(response => {
              this.presenter.displaySuccessMessage(
                `The contact ${contact.fullName} has been created`);
              this.getContacts();
            },
            err => {
              console.error(err);
              this.presenter.displayErrorMessage(
                'An error has occurred creating the contact, please try again later.'
              );
            }
          );
      });
  }

  /**
   * Archive a contact
   */
  private archiveContact(contact: Contact) {
    let id = contact.id;
    let name = this.getContactFullName(contact);

    this.contactService.archiveContact(id)
      .subscribe(response => {
          if (response.contact === undefined) {
            if (response.length === undefined) {
              this.paginator.totalItems -= 1;
            } else {
              this.paginator.totalItems -= response.length;
            }
          }
          if (typeof response.contact === 'object') {
            this.presenter.displayErrorMessage(
              `This action can't be done. The contact ${this.capitalizeString(name)} is a job primary contact`
            );
          } else {
            // remove loader
            if (response.archived === true) {
              this.presenter.displaySuccessMessage(`${this.capitalizeString(name)} archived.`);
              this.getContacts();
            }
            this.toggleActionButtonBar();
          }
        }, err => {
          this.presenter.displayErrorMessage(`${this.capitalizeString(name)} cannot be archived.`);
        }
      );
  }

  /**
   * Handle when user clicks the archive option
   * @param {any} e [description]
   */
  private archiveAction(e: any) {
    if (this.actionsBar.enabled) {
      let $this = this;
      this.presenter.displayYesNoMessage(this.actionsBar.deleteBtn.message)
        .filter(_.identity)
        .subscribe(() => $this.archiveChecked());
    }
  }

  /**
   * Function that handle list checkboxes
   */
  private uncheckAll() {
    this.contactsChecked.splice(0);
    this.toggleActionButtonBar();
    this.selectAllChecked = false;
  }

  /**
   * Bulk archive action.
   * is the callback passed to the alert component
   */
  private archiveChecked() {
    this.updateSelected(this.getCheckedContacts(), {archived: true});
    this.toggleActionButtonBar();

  }

  /**
   * Function to handle and sort (with API) alphabetically or by date.
   * @param {string} type [description]
   */
  private changeSortBy(type: string) {
    // update flags
    this.sort.sortedBy = type;
    if (type === 'name') {
      this.sort.nameAsc = !this.sort.nameAsc;
    } else if (type === 'email') {
      this.sort.emailAsc = !this.sort.emailAsc;
    } else {
      this.sort.dateCreatedAsc = !this.sort.dateCreatedAsc;
    }
    this.getContacts();
  }

  /**
   * Returns the proper sort icon name to display
   * @return {string} [description]
   */
  private getSortNameIcon(): string {
    if (this.sort.nameAsc) {
      return this.icons.nameUp;
    } else {
      return this.icons.nameDown;
    }
  }

  /**
   * Returns the proper sort icon name to display
   * @return {string} [description]
   */
  private getSortEmailIcon(): string {
    if (this.sort.emailAsc) {
      return this.icons.emailUp;
    } else {
      return this.icons.emailDown;
    }
  }

  /**
   * Returns the proper date icon name to display
   * @return {string} [description]
   */
  private getSortDateIcon(): string {
    if (this.sort.dateCreatedAsc) {
      return this.icons.dateUp;
    } else {
      return this.icons.dateDown;
    }
  }

  /**
   * Enable/disable methods
   * @param {Contact} contact contact object
   */
  private getEnabledStatus(contact: Contact) {
    if (!contact.active) {
      return 'Disabled';
    } else {
      return 'Active';
    }
  }

  /**
   * Function to toggle active/inactive contact.
   * @param {Contact} contact [description]
   */
  private toggleEnableStatus(contact: Contact) {
    contact.active = !contact.active;
    this.archiveContact(contact);
  }

  /**
   * Function to toggle active/inactive contact in bulk.
   *
   * @param {Contact} contact [description]
   * @param {boolean} active [description]
   */
  private bulkToggleEnabled(active: boolean) {
    this.contacts.forEach((element, index, array) => {
      if (this.isChecked(element)) {
        element.active = active;
      }
    });
  }

  //noinspection JSUnusedLocalSymbols
  /**
   * Function that handele contact list single action.
   *
   * @param {Object} action  The object with available actions to handle.
   * @param {Object} contact The object with contact information.
   */
  private singleContactAction(action, contact) {
    let $this = this;
    switch (action.id) {
      case 'enable':
      case 'disable':
        this.presenter.displayYesNoMessage(this.areUSureMsg)
          .filter(_.identity)
          .subscribe(() => $this.toggleEnableStatus(contact));
        break;
      case 'create-lead':
        this.presenter.displayYesNoMessage(this.areUSureMsg)
          .filter(_.identity)
          .subscribe(() => $this.router.navigate(['contacts/lead-create', contact.id]));
        break;
      case 'contacts-edit':
        this.presenter.displayAddOrUpdateDialog(contact)
          .subscribe(changedContact => {
            this.isLoading = true;
            //noinspection JSIgnoredPromiseFromCall
            this.contactService.update(changedContact)
              .subscribe(response => {
                  this.getContacts();
                  this.presenter.displaySuccessMessage(
                    `The contact ${changedContact.fullName} has been changed`);
                },
                err => {
                  console.error(err);
                  this.presenter.displayErrorMessage(
                    'An error has occurred creating the contact, please try again later.'
                  );
                }
              );
          });
        break;
      default:
        break;
    }
  }

  /**
   * Function to enable contacts in bulk.
   * @param {Object} action [description]
   */
  private bulkContactEnableAction(action) {
    let $this = this;
    switch (action.id) {
      case 'enable':
        this.presenter.displayYesNoMessage(this.areUSureMsg)
          .filter(_.identity)
          .subscribe(() => {
            $this.bulkToggleEnabled(true);
            /* uncheck checked contacts*/
            $this.uncheckAll();
          });
        break;
      case 'disable':
        this.presenter.displayYesNoMessage(this.areUSureMsg)
          .filter(_.identity)
          .subscribe(() => {
            $this.bulkToggleEnabled(false);
            // uncheck checked contacts
            $this.uncheckAll();
          });
        break;
      default:
        break;
    }
  }

  /**
   * Handle the export options dropdown.
   * @param {[type]} action [description]
   */
  private exportAction(action) {
    if (this.actionsBar.enabled) {
      switch (action.id) {
        case 'csv':
          this.exportContactsToCsv();
          break;
        case 'vcard':
          this.exportVCard();
          break;
        default:
          break;
      }
    } else {
      this.presenter.displayErrorMessage('You should select a contact to export');
    }
  }

  /**
   * Call the export vCard enpoint for the selected contacts ids,
   * then creates the newfile
   */
  private exportVCard() {
    let ids = this.contactsChecked;

    this.contactService.exportVCard(this.contactsChecked)
      .subscribe(data => {
          let file = new Blob([data['_body']], {type: 'text/vcard'});
          let filename = 'contacts.vcf';
          this.fileSaver.saveAs(file, filename);
        },
        error => console.error('Error downloading the file.', error),
        () => console.info('Completed file download.')
      );
  }

  /**
   * Update the contact list when a change page event is emited by pagination component.
   * @param {[type]} event [description]
   */
  private handlePageChange(event) {
    // update paginator
    this.paginator.currentPage = event.page;
    this.paginator.perPage = event.perPage;
    this.hasPages = (this.paginator.perPage !== 0 && this.paginator.totalItems > this.paginator.perPage);
    if (this.searching) {
      this.searchContacts();
    } else {
      this.getContacts();
    }
  }

  /**
   * Function to export selected contacts data to CSV file.
   */
  private exportContactsToCsv() {
    this.contactService.getCsv(this.contactsChecked)
      .subscribe(data => {
          let file = new Blob([data['_body']], {type: 'text/csv'});
          let filename = 'contacts.csv';
          this.fileSaver.saveAs(file, filename);
        },
        error => console.error('Error downloading the file.', error)
      );
  }

  /**
   * Filter the contact list by type.
   *
   * @param {[type]} event [description]
   * @param {[type]} type  [description]
   */
  private filterContactType(event, type) {
    let filterParams: string;
    // Used in view to perform a validation.
    this.contactTypeFilter = type;
    switch (type.toLowerCase()) {
      case 'all':
        filterParams = '';
        break;
      case 'client':
        filterParams = 'person_type=external';
        break;
      case 'vendor':
        filterParams = 'by_role=vendor';
        break;
      case 'lead':
        filterParams = 'by_role=referrer';
        break;
      default:
        break;
    }
    this.filterParams = filterParams;
    // call API to get contacts
    this.getContacts();
  }

  /**
   * Function to search contacts in list.
   */
  private searchContacts(value?: string) {
    if (_.isString(value)) {
      this.searchTerm = value.trim();
      this.paginator.currentPage = 1;
    }
    this.getContacts();
  }

  /**
   * Function to set the width of the th element of the table.
   */
  private setTableWidth() {
    this.generalFunctions.setTableWidth(this.document);
  }

  /**
   * Function to set the height of the th element of the table.
   */
  private setTableHeight() {
    this.generalFunctions.setTableHeight(this.document);
  }

  /**
   * Export actions handler (top toolbar)
   *
   * @param {any} e       [description]
   * @param {any} contact [description]
   */
  private exportActionsHandler(e: any) {
    switch (e.id) {
      case 'csv':
        this.exportContactsToCsv();
        break;
      case 'vcard':
        this.exportVCard();
        break;
      default:
        break;
    }
  }

  /**
   * Function to handle dropdown open / close event.
   *
   * @param {[type]} e [description]
   */
  private dropdownOpenCloseHandler(e) {
    if (e === 'opened' && this.actionsBar.enabled) {
      this.dropdownOpenedClass = ' dropdown-open ';
    } else {
      this.dropdownOpenedClass = '';
    }
  }

  /**
   * Function that capitalizes a name
   *
   * @param {[type]} e [description]
   */
  private capitalizeString(value: string) {
    // Call decimal pipe transform method
    value = this.capitalizePipe.transform(value);
    return value;
  }
}
