import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { Contact } from '../../models/contact';
import {
  DATE_TYPE_ANNIVERSARY, DATE_TYPE_BIRTHDAY, DateType
} from '../../models/contact-date';
import { ApiService } from '../api';
import { GeneralFunctionsService } from '../general-functions';
import { SocialNetwork } from '../../models/social-network';
import { AccessService } from '../access/access.service';

declare let require: (any);

type ChangedData = number|number[]|void;

@Injectable()
export class ContactService {
  // This event is emitted when the changes has been successfully sent to the server.
  // Any client interested in receiving notification when the local data
  // should be updated, should subscribe to this event.
  remoteDataHasChanged = new Subject<ChangedData>();

  /* Endpoints */

  // Contact endpoint
  private personEndpoint:        string = '/person/contact/';
  // Filtered contact endpoint
  private filterContactEndpoint: string = '/person/contact/';
  // Fields endpoint
  private fieldsEndpoint:        string = '/person/contact/fields/';
  // Types endpoint
  private typesEndpoint:         string = '/person/contacttype/';
  // Contact Dates endpoint
  private contactDateEndpoint:   string = '/person/contact_date/';
  private dateTypeEndpoint:   string = '/person/date_type/';
  // contact endpoint
  private contactEndpoint:       string = '/account/account/' + this.apiService.getAccount() + '/contact/';
  private createContactEndpoint: string = '/person/contact/';
  private contactEndpointUpdate: string = '/person/contact/';
  private bulkEndpoint: string = '/person/contact_bulk/';
  // Merge contact endpoint
  private mergeContactEndpoint:  string = '/person/contact/:person_id/merge/';
  private searchContactEndpoint: string = '/person/contact/?search=';
  /* Contact activity list */
  private contactActivityList:   string = '/person/contact/:contact_id/activity/';
  /* Other vars */
  private contactTypes = [];
  private emailTypeService;
  private phoneTypeService;
  private phoneType;
  private emailType;
  private file: any;

  public static newObject(data?: object): Contact {
    let result = Object.assign(new Contact(), data || {});
    result.social_networks = (result['social_networks'] || [])
      .map(value => Object.assign(new SocialNetwork(), value || {}));
    return result;
  }

  // Initialize services
  constructor(private apiService: ApiService,
              private functions: GeneralFunctionsService) {
  }

  /**
   * [exportVCard description]
   * @param {number[]} ids [description]
   */
  public exportVCard(ids?: number[]) {
    let endpoint = '/person/export_contact_vcard/';

    if (ids !== undefined && ids.length > 0) {
      let param = '?id=';
      for (let id of ids) {
        param += id.toString() + ',';
      }
      param = param.slice(0, param.length - 1);
      endpoint += param;
    }
    let headers = {
      accept: 'text/vcard'
    };
    return this.apiService.getFile(endpoint, headers);
  }

  /**
   * Get the contact list.
   * This list may use filters to get an accurate list of contacts.
   */
  public getContactList(params: any = {}) {
    // parameter string
    let p = '?active=True';
    let paginator = params.paginator;
    let order = params.order;
    let filters = params.filters;
    // pagination
    if (paginator !== undefined) {
      p += paginator;
    }
    if (paginator !== undefined || order !== undefined) {
      p += '&';
    }

    // ordering
    if (order !== undefined) {
      p += order;
    }

    // need to use QueryParams Object
    if (params.contact_types) {
      p += `&contact_types=${params.contact_types}`;
    }
    if (params.job) {
      p += `&job=${params.job}`;
    }
    if (params.page_size) {
      p += `&page_size=${params.page_size}`;
    }
    if (params.hasOwnProperty('archived')) {
      p += `&archived=${params.archived}`;
    }

    // need to use QueryParams Object
    if (filters) {
      p += `&contact_types=${filters}`;
    }

    if (params.search) {
      p += `&search=${params.search}`;
    }

    return this.apiService.get(this.personEndpoint + p)
      .map(data => {
        let contactList = [];
        for (let contact of data.results) {
          // SQNG-1029, SQNG-1030: Required to show archived contacts so remove the if condition
          // if (!contact.archived) { // Do not show contact in the list if it is archived.
            contactList.push(this.formatContact(contact));
          // }
        }
        return {
          page: contactList,
          count: data.count
        };
      });
  }

  /**
   * Get the contact list.
   * This list may use filters to get an accurate list of contacts.
   */
  public getList(options: object = {}) {
    let searchParams = new URLSearchParams();
    // options = _.pickBy(options);
    _.each(options, (value, key) => {
      if (value === 0)
        return;
      searchParams.set(key, value);
    });
    let query = _.isEmpty(options) ? '' : '?' + searchParams.toString();
    return this.apiService.get(this.personEndpoint + query);
  }

  public getContactListByJob(jobId: number, params: any = {}) {
    params.job = jobId;
    return this.getContactList(params);
  }

  /**
   * Get the contact activity list (Activity Feed)
   * @param {any} params [description]
   */
  public getContactActivityList(id, params?: any) {
    let endpoint = this.contactActivityList.replace(':contact_id', id);
    let queryString = _.map(params, (v, k) => `${k}=${v}`).join('&');
    return this.apiService.get(`${endpoint}?${queryString}`);
  }

  /**
   * Get the contacts list with filters
   * @param {any} params an objects with filter, pagination and sort param info
   */
  getFilteredContactList(params?: any) {
    let p = '';
    if (params !== undefined && params.filters !== undefined) {
      p += '?' + params.filters;
    }
    if (params !== undefined && params.order !== undefined) {
      p += '&' + params.order;
    }
    if (params !== undefined && params.paginator !== undefined) {
      p += '&' + params.paginator;
    }
    return this.apiService.get(this.filterContactEndpoint + p)
      .map(data => {
        let contactList = [];
        for (let contact of data.results) {
          // SQNG-1029, SQNG-1030: Required to show archived contacts so remove the if condition
          // if (!contact.archived) { // Do not show contact in the list if it is archived.
            contactList.push(this.formatContact(contact));
          // }
        }
        return {
          page: contactList,
          count: data.count
        };
      });
  }

  /**
   * call the bulk create passing an array of contacts
   * @param {any[]} contacts [description]
   */
  public bulkCreate(contacts: any[]) {
    return this.apiService.post(this.bulkEndpoint, contacts).do(() => this.remoteDataHasChanged.next());
  }

  /**
   * Delete a contact
   * @param {number} id: the contact id
   */
  public deleteContact(id: number) {
    let path = `${this.personEndpoint}${id}/`;
    return this.apiService.delete(path).do(() => this.remoteDataHasChanged.next(id));
  }

  /**
   * Bulk Delete a contact
   * @param {number} id: the contact id
   */
  public bulkDeleteContact(ids: Array<number>) {
    let path = `${this.personEndpoint}?id=${ids.join()}`;
    return this.apiService.delete(path).do(() => this.remoteDataHasChanged.next(ids));
  }

  /**
   * Archive a contact
   * @param {number} id: the contact id
   */
  public archiveContact(id: number) {
    let path = `${this.personEndpoint}${id}/`;
    return this.apiService.patch(path, { 'archived': true, 'active': false })
      .do(() => this.remoteDataHasChanged.next(id));
  }

  /**
   * Set default phone
   * @param {number} id: the contact id
   * @param {number} phoneId: phone id
   */
  public setDefaultPhone(id: number, phoneId: number) {
    let path = `${this.personEndpoint}${id}/`;
    return this.apiService.patch(path, { 'default_phone': phoneId })
      .do(() => this.remoteDataHasChanged.next(id));
  }

  /**
   * Set default email
   * @param {number} id: the contact id
   * @param {number} emailId: the email id
   */
  public setDefaultEmail(id: number, emailId: number) {
    let path = `${this.personEndpoint}${id}/`;
    return this.apiService.patch(path, { 'default_email': emailId })
      .do(() => this.remoteDataHasChanged.next(id));
  }

  /**
   * Set default address
   * @param {number} id: the contact id
   * @param {number} addressId: the email id
   */
  public setDefaultAddress(id: number, addressId: number) {
    let path = `${this.personEndpoint}${id}/`;
    return this.apiService.patch(path, { 'default_address': addressId })
      .do(() => this.remoteDataHasChanged.next(id));
  }

  /**
   * Function to get contact by id number.
   *
   * @param {number} id The contact id to search.
   */
  public getContact(id: number) {
    let path = `${this.personEndpoint}${id}/`;
    return this.apiService.get(path);
  }

  /**
   * Function to get contact correspondence by id contact.
   *
   * @param {number} id The contact id to search correspondence.
   */
  public getContactCorrespondence(id: number) {
    let path = `${this.personEndpoint}${id}/correspondence/`;
    return this.apiService.get(path);
  }

  /**
   * Returns an Observavle with
   */
  public getContactFields(): Observable<any> {
    return this.apiService.get(this.fieldsEndpoint);
  }

  public getDateTypes(): Observable<DateType[]> {
    return this.apiService.get(this.dateTypeEndpoint)
      .map(response => _.map(response.results, item => Object.assign(new DateType(), item)));
  }

  /**
   * Function to update contact types.
   */
  public getRequestContactTypes(): Observable<any> {
    return this.apiService.get(this.typesEndpoint)
      .map(response => response.results);
  }
  /**
   * Get contact types function
   */
  public getContactTypes() {
    return this.contactTypes;
  }

  /**
   * Function to create contact using API endpoint.
   *
   * @param {Array} data the form data to make body and perform the post.
   */
  public quickCreate(data) {
    return this.apiService.post(this.contactEndpoint, data)
      .do(() => this.remoteDataHasChanged.next());
  }

  /**
   * Function to create contact using API endpoint.
   *
   * @param {Array} data the form data to make body and perform the post.
   */
  public create(data: any) {
    data.account = this.apiService.getAccount();
    return this.apiService.post(this.createContactEndpoint, data)
      .do(() => this.remoteDataHasChanged.next());
  }

  /**
   * Function to update contact using API endpoint.
   *
   * @param {Array} data the form data to make body and perform the post.
   */
  public update(data) {
    return this.apiService.put(`${this.contactEndpointUpdate}${data.id}/`, data, '')
      .do(() => this.remoteDataHasChanged.next(data.id));
  }

  public patch(data) {
      return this.apiService.patch(`${this.contactEndpointUpdate}${data.id}/`, data)
        .do(() => this.remoteDataHasChanged.next(data.id));
  }

  public doMerge(id1, id2, data) {
    let endpoint = this.mergeContactEndpoint.replace(':person_id', id1);
    return this.apiService.post(endpoint, data)
      .do(() => this.remoteDataHasChanged.next([id1, id2]));
  }

  /**
   * Function to get csv using API endpoint.
   * @param {number} contact id.
   */
  public getCsv(ids?: number[]) {
    let endpoint = '/person/export_contact_csv/';

    if (ids !== undefined && ids.length > 0) {
      let param = '?id=';
      for (let id of ids) {
        param += id.toString() + ',';
      }
      param = param.slice(0, param.length - 1);
      endpoint += param;
    }
    let headers = {
      accept: 'text/csv'
    };
    return this.apiService.getFile(endpoint, headers);
  }
  /**
   * Function to serach contacts by search term
   *
   * @param  {string}     searchTerm The search term (name or lastname).
   * @return {Obserbable} The observable.
   */
  public searchContact(searchTerm: string, params: any = {page: 1, per_page: 10, archived: 'False', active: 'True'}): Observable<any> {
    let queryString = _.map(params, (v, k) => `${k}=${v}`).join('&');
    return this.apiService.get(`${this.searchContactEndpoint}${searchTerm}&${queryString}`)
      .map(response => {
        let $this = this;
        return {contacts: response.results.filter(function(obj) {
          return  obj;
        }), total: response.count};
      });
  }

  /**
   * Format the contact list to display contacts
   * @param {Array<any>} contactList [description]
   */
  public formatContactList(contactList: Array<any>) {
    let formatedList = [];
    for (let contact of contactList) {
      formatedList.push(this.formatContact(contact));
    }
    return formatedList;
  }
  /**
   * [setFile description]
   */
  public setFile(file: any) {
    this.file = file;
  }
  /**
   * [getFile description]
   */
  public getFile() {
    return this.file;
  }
  /**
   * Format the contact data received from API
   *
   * @param {Object}
   */
  public formatContact(contact: any) {
    let c = {
      id: contact.id,
      first_name: contact.first_name,
      maiden_name: contact.maiden_name,
      last_name: contact.last_name,
      full_name: contact.full_name,
      created: contact.created,
      default_phone_details: contact.default_phone_details,
      default_phone: (contact.default_phone_details && contact.default_phone_details.number) ? contact.default_phone_details.number : '',
      phones: contact.phones,
      default_email: (contact.default_email_details && contact.default_email_details.address) ? contact.default_email_details.address : '',
      default_email_details: contact.default_email_details,
      emails: contact.emails,
      default_address: this.getDefaultAddress(contact),
      default_social_network: contact.default_social_network_details,
      social_networks: contact.social_networks,
      website: this.getWebsite(contact),
      type: '-',
      active: contact.active,
      archived: contact.archived,
      balance_due: contact.balance_due,
      balance_overdue: contact.balance_overdue,
      next_due_date: contact.next_due_date,
      total_revenue: contact.total_revenue,
      contact_types: contact.contact_types,
      anniversary: this.getAnniversary(contact),
      birthday: this.getBirthday(contact)
    };
    return c;
  }
  /**
   * Function to delete contact dates using API endpoint.
   *
   * @param {number} id [date id to delete]
   */
  public deleteContactDate(id: number) {
    return this.apiService.delete(`${this.contactDateEndpoint}${id}/`)
      .do(() => this.remoteDataHasChanged.next(id));
  }
  /**
   * Function to get contact jobs from API.
   * @param {number} id [description]
   */
  public getContactJobs(id: number) {
    let path = `${this.personEndpoint}${id}/jobs/`;
    return this.apiService.get(path);
  }
  /**
   * Function to get invoices by id contact number.
   *
   * @param {number} id The contact id to search invoices.
   */
  public getContactInvoices(id: number) {
    let path = `${this.personEndpoint}${id}/invoices/`;
    return this.apiService.get(path);
  }
  /**
   * Function to get contracts by id contact number.
   *
   * @param {number} id The contact id to search contracts.
   */
  public getContactContracts(id: number) {
    let path = `${this.personEndpoint}${id}/contracts/`;
    return this.apiService.get(path);
  }
  /**
   * Function to get available phone types by id contact number.
   *
   * @param {number} id The contact id to search contracts.
   */
  public contactAvailablePhoneTypes(id: number) {
    let path = `${this.personEndpoint}${id}/phone_types/`;
    return this.apiService.get(path);
  }

  bulkPatch(data: Array<{ id: Number }>) {
    return this.apiService.patch(`${this.personEndpoint}`, data);
  }
  /**
   * Function to get full API URL.
   * @param {string} fullUrl [description]
   */
  private getPath(fullUrl: string) {
    return fullUrl.substring(this.apiService.getApiUrl().length);
  }
  /**
   * Function to get the email from API endpoint.
   *
   * @param {number} id [description]
   * @param {json} data [description]
   */
  private personGetEmail(id, data) {
    for (let email of data.emails) {
      if (email.id === id) {
        return email.address;
      }
    }
    return '';
  }
  /**
   * Function to get the phone number from API endpoint.
   *
   * @param {[type]} id   [description]
   * @param {[type]} data [description]
   */
  private personGetPhoneNumber(id, data) {
    for (let phone of data.phones) {
      if (phone.id === id) {
        return phone.number;
      }
    }
    return '';
  }
  /**
   * return the default phone, use getDefault method
   * @param  {Object}
   * @return {string}
   */
  private getDefaultPhone(contact: Object): string {
    return this.getDefault('default_phone', 'phones', 'number', contact);
  }
  /**
   * return the default email, use getDefault method
   * @param  {Object}
   * @return {string}
   */
  private getDefaultEmail(contact: Object): string {
    return this.getDefault('default_email', 'emails', 'address', contact);
  }
  /**
   * Return the default address, use getDefault method
   * @param  {Object} contact [description]
   * @return {any}            [description]
   */
  private getDefaultAddress(contact: Object): any {
    return this.getDefault('default_address', 'addresses', ['address1',
                                                            'address2',
                                                            'city',
                                                            'country',
                                                            'state',
                                                            'zip',
                                                            'visible'], contact);
  }
  /**
   * [getWebsite description]
   * @param {[type]} contact [description]
   */
  private getWebsite(contact: any) {
    for (let social of contact.social_networks) {
      if (social.network === 'website') {
        return social.network_id;
      }
    }
    return '-';
  }
  /**
   * [getAnniversary date]
   * @param {[type]} contact [description]
   */
  private getAnniversary(contact: any) {
    for (let date of contact.dates) {
      if (date.date_type_details.slug === DATE_TYPE_ANNIVERSARY) {
        return date.date;
      }
    }
  }
  /**
   * [getBirthday date]
   * @param {[type]} contact [description]
   */
  private getBirthday(contact: any) {
    for (let date of contact.dates) {
      if (date.date_type_details.slug === DATE_TYPE_BIRTHDAY) {
        return date.date;
      }
    }
  }
  /**
   * Generic default option search function
   *
   * @param  paramDefault {string}: in the contact object the default searched attribute
   * @param  paramSearch {string}: the array attribute of the contact object
   * @param  paramReturn {string}: the attribute to return from inside the array search
   * @param  contact {Object}: the contact object
   * @return {string}: returns the searched attribute or '-' if search isn't successful
   */
  private getDefault(paramDefault: string, paramSearch: string, paramReturn: any, contact: Object): string {

    let arraySearch = contact[paramSearch];

    if (contact[paramDefault] !== undefined && contact[paramDefault] !== null && arraySearch.length > 0) {
      let id = contact[paramDefault];
      let paramReturnObject: any = {};
      // Search the default entity
      for (let a of arraySearch) {
        if (a['id'] === id) {
          if (paramReturn instanceof Array) {
            for (let param of paramReturn) {
              if (param === 'state') {
                paramReturnObject['state_name'] = this.functions.getStateNameByIsocode2(a[param]);
              }
              if (param === 'country') {
                paramReturnObject['country_name'] = this.functions.getCountryNameByIsocode2(a[param]);
              }
              paramReturnObject[param] = a[param];
            }
            return paramReturnObject;
          } else {
            return a[paramReturn];
          }
        }
      }
      // If not found return the first one
      return arraySearch[0][paramReturn];
    } else {
      // entity is empty
      return '-';
    }
  }
}
