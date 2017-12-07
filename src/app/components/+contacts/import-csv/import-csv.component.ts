import {
  Component,
  ViewChild,
  Inject, ViewContainerRef }                         from '@angular/core';
import { DOCUMENT }                 from '@angular/platform-browser';

import { Observable }               from 'rxjs/Observable';
import { Modal, Overlay, overlayConfigFactory } from 'single-angular-modal';

import { FlashMessageService }      from '../../../services/flash-message';
import { ContactService }           from '../../../services/contact';
import { ApiService }               from '../../../services/api';
import { GeneralFunctionsService }  from '../../../services/general-functions';
import { ModalService }             from '../../../services/modal/';
import { PhoneTypeService }         from '../../../services/phone-type/';
import { EmailTypeService }         from '../../../services/email-type/';
import { DateService }              from '../../../services/date/';
import { contactField }             from '../../../models/contactField';
import {
  ImportCSVStepFourModalComponent,
  ImportCSVStepFourWindowData
} from './step-four-modal/step-four-modal.component';

@Component({
    selector: 'import-csv',
    templateUrl: 'import-csv.component.html',
    styleUrls: ['import-csv.component.scss'],
    providers: [GeneralFunctionsService, PhoneTypeService, EmailTypeService, DateService]
})
export class ImportCSVComponent {
  public step: number = 1;
  public importingNewCSV: boolean = false;

  private fileData: any = {
    content: [],
    fields: []
  };
  private alertify = require('../../../assets/theme/assets/vendor/alertify-js/alertify.js');
  private moment;
  private reader: FileReader;
  private csvFile;
  private checkedContacts = [];
  private allChecked = false;

  private fields = [];
  private fieldsMapped = [];
  private shootQFields = {};
  private shootQFieldsList = [];
  private fieldSubscriber;
  private createSubscriber;
  private isFieldSuscribed = false;
  private isCreateSubscribed = false;
  private allFields = [];
  // has the CSV field => shootQ field map info
  private mappedFields = {};
  // has the shootQ field => CSV field map info
  private mappedShootQFields: any = {};
  // list of fields mapped
  private mappedFieldsList: any[] = [];
  private mappedShootQFieldsList: any[] = [];
  private areFieldsLoaded: boolean = false;
  private automaticMapped: boolean = false;
  private fileLoadedFromModal: boolean = true;
  // generated contact with CSV info
  private generatedContacts = [];
  private generatedContactsBkp = [];
  private selectedContactTypesBulk = [];
  // response and error from create service
  private response;
  private logError;
  // general functions service
  private functions;
  // spin animation status
  private isLoading = false;
  private pageChange;
  // paginator
  private paginator = {
    perPage: 0,
    currentPage: 1,
    total: 10,
    first: 0,
    last: 10,
    maxSize: 5
  };
  private items: Array<any> = [];

  private blurSelectId;
  private selectChangeId;
  // save the current opened selector
  // used to close the other selectors
  private openSelectId;
  private componentRef;
  @ViewChild('selectAll') private select: any;
  @ViewChild('inputFile') private inputFile: any;
  private bulkContactTypeId: number = 0;
  private search_box: string;
  private searching: boolean;
  private modalInstance = null;
  // Address ids
  private homeAddressId: number;
  private workAddressId: number;
  private homePhoneId: number;
  private workPhoneId: number;
  private mobilePhoneId: number;
  private workEmailId: number;
  private homeEmailId: number;
  private birthdayId: number;
  private anniversaryId: number;
  private innerWidth;
  private phoneMaskPattern: any = /^([0-9-()+. ]*)$/g;

  constructor(public modal: Modal,
              public overlay: Overlay,
              public vcRef: ViewContainerRef,
              private flash: FlashMessageService,
              private apiService: ApiService,
              private contactService: ContactService,
              private phoneTypeService: PhoneTypeService,
              private emailTypeService: EmailTypeService,
              private dateService: DateService,
              private generalFunctionsService: GeneralFunctionsService) {
    overlay.defaultViewContainer = vcRef;

    this.functions = generalFunctionsService;
    this.moment = generalFunctionsService.getMomentJS();
    this.initFileReader();
  }

  ngOnInit() {
    this.isLoading = true;
    this.step = 1;
    // Init alertify
    this.alertify.theme('bootstrap-shootq');
    this.alertify.okBtn('OK');

    let observableArray = [];

    observableArray.push(this.contactService.getContactFields());
    observableArray.push(this.phoneTypeService.getList());
    observableArray.push(this.emailTypeService.getList());
    observableArray.push(this.dateService.getTypes());
    observableArray.push(this.contactService.getRequestContactTypes());

    Observable.forkJoin(observableArray)
      .subscribe(
        data => {
          if (data.length === 5) {
            // shootQ fields list
            if (data[0] && data[0]['fields'] !== undefined) {
              this.listFields(data[0]['fields']);
            }
            //  Phone types
            if (data[1] && data[1]['results'] !== undefined) {
              this.setPhonesTypeIds(data[1]['results']);
            }
            // Emails types
            if (data[2] && data[2]['results'] !== undefined) {
              this.setEmailsTypeIds(data[2]['results']);
            }
            // Date types
            if (data[3] && data[3]['results'] !== undefined) {
              this.setDatesTypeIds(data[3]['results']);
            }
          }
        },
        err => console.error(err),
        () => this.isLoading = false
      );
  }

  ngOnDestroy() {
    this.removeSubscription();
  }

  ngAfterViewInit() {
    this.innerWidth = window.innerWidth;
    this.updatePaginatorMaxSize();
    let $this = this;
    window.addEventListener('resize', function(e: any){
      $this.innerWidth = window.innerWidth;
      $this.updatePaginatorMaxSize();
    }, false);
  }

  ngDoCheck() {
    if (this.fileLoadedFromModal && this.areFieldsLoaded && !this.automaticMapped) {
      // automatic mapping when the file is loaded from modal
      this.initFileReader();
      this.csvFile = this.contactService.getFile();
      if (this.csvFile !== undefined) {
        this.reader.readAsText(this.csvFile);
      }
    } else if (this.importingNewCSV) {
      // open select file dialog
      let el: any = document.getElementById('import-csv-button');
      if (el && el !== undefined) {
        this.importingNewCSV = false;
        el.click();
      }
    }
  }

  /**
   * Set parent component ref
   * @param {[type]} ref [reference od parent component object]
   */
  public setComponentRef(ref) {
    this.componentRef = ref;
  }

  ngAfterViewChecked() {
  }

  /**
   * Set the objet fileData attribute
   * @param {Object} obj an object with the csv file data with the attributes {content, fields}
   */
  public setFileData(obj: Object) {
    this.fileData = obj;
    let cont = 1;
    for (let contact of this.fileData.content) {
      contact.id = cont;
      cont++;
    }
  }
  /**
   * restart import csv to step 1
   */
  public restart() {
    this.fileData = {
      content: [],
      fields: []
    };
    this.csvFile = undefined;
    this.checkedContacts = [];
    this.allChecked = false;
    this.step = 1;
    this.removeSubscription();
    this.mappedFields = {};
    this.mappedShootQFields = {};
    this.mappedFieldsList = [];
    this.mappedShootQFieldsList = [];
    this.generatedContacts = [];
    this.selectedContactTypesBulk = [];
    this.response = undefined;
    this.logError = undefined;
  }
  /**
   * [getFullName description]
   * @param {[type]} contact [description]
   */
  public getFullName(contact) {
    return this.functions.getContactFullName(contact);
  }

  /**
   * increment the step atribute to set the next step
   */
  private nextStep() {
    this.step++;
    this.isLoading = true;
    switch (this.step) {
      case 2:
        this.isLoading = false;
        break;
      case 3:
        this.isLoading = false;
        if (this.areFieldValids()) {
          this.generateContactList();
          this.paginator.total = this.generatedContacts.length;
          this.paginator.first = 0;
          this.paginator.last = this.paginator.total - 1;
        } else {
          this.flash.error('first_name and last_name are required fields');
          this.step--;
        }
        break;
      default:
        break;
    }
  }

  /**
   * Initalize the fileReader object
   */
  private initFileReader() {
    this.reader = new FileReader();
    this.allFields = [];
    let $this = this;
    this.reader.onload = function(event: any) {
      $this.allFields = [];
      $this.isLoading = true;
      let csvContent = event.target.result;
      // display flash success?
      let data = $this.parseCSVFile(csvContent);
      $this.setFileData(data);
      // automatic mapping
      for (let field of $this.fileData.fields) {
        $this.allFields.push(field);
        $this.defaultMapping(field);
      }
      $this.automaticMapped = true;
      $this.step = 2;
      $this.isLoading = false;
    };
  }

  /**
   * Function to cancel process and return to step 1
   */
  private cancelAndGoToFirstStep() {
    this.step--;
  }
  /**
   * Open the modal of the las step
   */
  private modalOpen() {
    let contactsCreated = this.response.length;

    this.modal
      .open(
        ImportCSVStepFourModalComponent,
        overlayConfigFactory({contactsCreated: contactsCreated},
          ImportCSVStepFourWindowData)
      )
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            if (result.action === 'import') {
              this.restart();
              return;
            }
            setTimeout(() => {
              this.functions.navigateTo('contacts');
            }, 300);
          })
          .catch(() => {
          });
      });
  }

  /**
   * cancel action
   * redirect to contact list
   */
  private cancel() {
    let $this = this;
    this.alertify.confirm('Do yo want to cancel the contact import process?', function(){
      $this.functions.navigateTo('contacts');
    });
  }

  /**
   * handle when a file is selected
   */
  private fileSelected(event, fromModal: boolean = false) {
    this.fileLoadedFromModal = fromModal;
    this.step = 1; // Force to step 1. Never should go to step 3 after select csv file.
    this.csvFile = event.target.files[0];
    let type = event.target.files[0].type;
    let extension: string = event.target.files[0].name;
    extension = extension.substring(extension.length - 4);

    // check file extension and valid csv Mime types from http://filext.com/file-extension/CSV
     // Added type === '' because Chrome running on windows 10 set csv mime type to ""
    if (extension === '.csv' && (type === 'text/csv' || type === 'text/comma-separated-values'
      || type === 'application/csv' || type === 'application/excel' || type === 'application/vnd.ms-excel'
      || type === 'application/vnd.msexcel' || type === 'text/anytext') || type === '') {
      this.reader.readAsText(this.csvFile);
    } else {
      this.flash.error('Wrong file type. The file must be a .csv file');
    }
  }
  /**
   * [parseCSVFile description]
   * @param {string} content [description]
   */
  private parseCSVFile(content: string) {
    // rows of the csv file
    let rows = content.split('\n');
    // fields contained in the csv file
    let fields = rows[0].split(',');
    let nfields = fields.length;
    let contacts = [];
    // parse to json
    for (let i = 1; i < rows.length; i++) {
      let aux = {};
      let row = rows[i].split(',');
      if (row.length === nfields) {
        for (let j = 0; j < nfields; j++) {
          let f = fields[j];
          // remove spaces
          f = f.replace(/\s$/g, '');
          let r = row[j];
          r = r.replace(/\s$/g, '');
          fields[j] = f;
          aux[f] = r;
        }
        contacts.push(aux);
      }
    }
    return {
      content: contacts,
      fields: fields
    };
  }
  /**
   * Add the id to the contacts checked array
   * @param {number} id: the contact imported id
   */
  private checkContact(contact: any) {
    let id = contact.id;
    let i = this.checkedContacts.indexOf(id);
    if (i !== -1) {
      this.checkedContacts.splice(i, 1);
      contact.alertContactType = false;
      this.allChecked = false;
    } else {
      this.checkedContacts.push(id);
      this.checkContactType(contact);
    }
  }
  /**
   * Toggle the chekAll status.
   * remove all the contacts of the contacts checked array or add all the contacts to it,
   * depends on the value of allChecked attribute.
   */
  private toggleCheckAll() {
    this.allChecked = !this.allChecked;
    if (this.allChecked) {
      for (let contact of this.fileData.content){
        let i = this.checkedContacts.indexOf(contact.id);
        if (i === -1) {
          this.checkContact(contact);
        }
      }
    } else {
      this.checkedContacts.splice(0);
    }
  }
  /**
   * [resetChecked description]
   */
  private resetChecked() {
    this.checkedContacts.splice(0);
    this.allChecked = false;
  }

  /**
   * return if the contact is checked
   * @param  {number}  id: the imported contact id
   * @return {boolean}    true if the contact is checked, false if he isn't
   */
  private isChecked(id: number): boolean {
    let i = this.checkedContacts.indexOf(id);
    return (i !== -1);
  }
  /**
   * [canCreate description]
   * @return {boolean} [description]
   */
  private canCreate(): boolean {
    return this.checkedContacts.length > 0;
  }
  /**
   * [createContacts description]
   */
  private createContacts() {
    this.isLoading = true;
    // generate contact list
    let contactList = [];
    for (let contact of this.generatedContacts) {
      if (this.isChecked(contact.id)) {
        contactList.push(contact.data);
      }
    }
    let messageErrors = [];
    this.createSubscriber = this.contactService.bulkCreate(contactList)
      .subscribe(data => {
          // check if the contacts was created succesfully
          let errors = this.functions.validateResponseData(data);
          if (errors.length > 0) {
            for (let err of errors) {
              this.flash.error('Error: ' + err);
            }
            this.response = [];
            this.modalOpen();
          } else if (data.length !== undefined && data.length > 0) {
            this.response = data;
            this.modalOpen();
          } else {
            this.flash.error('Contacts couldn\'t be imported. Please try again later');
          }
          this.isLoading = false;
        },
        err => {
          console.error(err);
          this.flash.error('An error has occurred creating the contact, please try again later.');
          this.isLoading = false;
        },
        () => {});
    this.isCreateSubscribed = true;
  }
  /**
   * Return if the field from CSV file is mapped
   * @param {string} fieldCSV [description]
   */
  private isMapped(fieldCSV: string) {
    if (this.mappedFieldsList.indexOf(fieldCSV) !== -1) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * Returns if a field from CSV file is mapped to a shootQ field
   * @param  {string}  fieldCSV    the name of the field in the CSV file
   * @param  {string}  fieldShootQ the name of the field in ShootQ
   * @return {boolean}             return true if fieldCSV is mapped to fieldShootQ
   */
  private areMapped(fieldCSV: string, fieldShootQ: any): boolean {
    if (this.mappedFields[fieldCSV] !== undefined && this.mappedFields[fieldCSV].slug === fieldShootQ.slug) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * Map fields, adding the shootQ field to the mappedFieldList using the CSV field name as key
   * @param {string}       field       the field name in the csv file
   * @param {contactField} fieldShootQ a contactField object
   */
  private mapFields(field: string, fieldShootQ: any) {
    // add to mapped field list
    if (this.mappedFieldsList.indexOf(field) === -1) {
      this.mappedFieldsList.push(field);
    } else {
      // remove the shootQ field from the mapped shootQ list
      let fieldName = this.mappedFields[field].slug;
      this.removeMappedFieldShootQ(fieldName);
    }

    if (this.mappedShootQFieldsList.indexOf(fieldShootQ.slug) === -1) {
      this.mappedShootQFieldsList.push(fieldShootQ.slug);
    } else {
      // remove from previous selector
      for (let f of this.mappedFieldsList) {
        if (this.mappedFields[f].slug === fieldShootQ.slug ) {
          // remove from mapped field list
          this.removeMappedFieldCSV(f);
          break;
        }
      }
    }
    this.mappedFields[field] = fieldShootQ;
    this.mappedShootQFields[fieldShootQ.slug] = field;
  }
  /**
   * map the fields when the user select an option
   * @param {string} fieldCSV [description]
   * @param {[type]} event    [description]
   */
  private mapFieldsOnChange(fieldCSV: string, event) {
    let shootQFieldName = event.target.value;
    // remove from mapped
    if (shootQFieldName === 'default') {
      let shootQField = this.mappedFields[fieldCSV].slug;
      this.removeMappedFieldCSV(fieldCSV);
      this.removeMappedFieldShootQ(shootQField);
    } else if (this.shootQFields[shootQFieldName] !== undefined) {
      this.mapFields(fieldCSV, this.shootQFields[shootQFieldName]);
    }
  }
  /**
   * [removeMappedFieldCSV description]
   * @param {string} fieldCSV [description]
   */
  private removeMappedFieldCSV(fieldCSV: string) {
    let i = this.mappedFieldsList.indexOf(fieldCSV);
    if (i !== -1) {
      this.mappedFieldsList.splice(i, 1);
      this.mappedFields[fieldCSV] = undefined;
    }
  }
  /**
   * [removeMappedFieldShootQ description]
   * @param {[type]} field [description]
   */
  private removeMappedFieldShootQ(field) {
    let i = this.mappedShootQFieldsList.indexOf(field);
    if (i !== -1) {
      this.mappedShootQFieldsList.splice(i, 1);
      this.mappedShootQFields[field] = undefined;
    }
  }
  /**
   * create an array with the API fields names
   * @param {contactField[]} fieldList [description]
   */
  private listFields(fieldList: any[]) {
    this.shootQFields = {};
    this.shootQFieldsList = [];
    this.fields = [];
    for (let field of fieldList) {
      let aux = this.functions.getSlug(field.name);
      if (aux !== 'account') {
        field['slug'] = aux;
        this.fields.push(field);
        this.shootQFieldsList.push(field.slug);
        this.shootQFields[field.slug] = field;
      }
    }
    if (this.fields.length > 0) {
      this.areFieldsLoaded = true;
    }
  }
  /**
   * map an field to the shootq field,
   * iterates over all of the shootQ fields
   * @param {string} fieldCSV [description]
   */
  private defaultMapping(fieldCSV: string) {
    // remove blank spaces

    for (let field of this.shootQFieldsList) {
      if (fieldCSV === field) {
        this.mapFields(field, this.shootQFields[field]);
        break;
      }
    }
  }

  /**
   * Set the home and work emails ids
   * @param {[type]} types [description]
   */
  private setEmailsTypeIds(types) {
    if (types !== undefined && types.length > 0) {
      for (let a of types) {
        if (a.slug === 'home') {
          this.homeEmailId = a.id;
        } else if (a.slug === 'work') {
          this.workEmailId = a.id;
        }
      }
    }
  }

  /**
   * Set the home, work and mobile phones ids
   * @param {[type]} types [description]
   */
  private setPhonesTypeIds(types) {
    if (types !== undefined && types.length > 0) {
      for (let a of types) {
        if (a.slug === 'home') {
          this.homePhoneId = a.id;
        } else if (a.slug === 'work') {
          this.workPhoneId = a.id;
        } else if (a.slug === 'mobile') {
          this.mobilePhoneId = a.id;
        }
      }
    }
  }

  /**
   * Set the anniversary and birthday date ids
   * @param {[type]} types [description]
   */
  private setDatesTypeIds(types) {
    if (types !== undefined && types.length > 0) {
      for (let a of types) {
        if (a.slug === 'anniversary') {
          this.anniversaryId = a.id;
        } else if (a.slug === 'birthday') {
          this.birthdayId = a.id;
        }
      }
    }
  }

  /**
   * Generate the contact list with the CSV mapped data
   */
  private generateContactList() {
    for (let contact of this.fileData.content) {
      // generate the contact
      let aux: any = {
        id: contact.id,
      };
      let data: any = {};

      let fieldArray = ['first_name', 'last_name', 'maiden_name', 'company'];
      for (let f of fieldArray) {
        data[f] = (this.mappedShootQFields[f] !== undefined && contact[f] !== undefined && contact[f] !== '') ? contact[f].toLowerCase() : '';
      }

      let phones = this.getContactPhones(contact);
      if (phones.length > 0) {
        data.phones = phones;
      }
      let emails = this.getContactEmails(contact);
      if (emails.length > 0) {
        data.emails = emails;
      }
      let addresses = this.getContactAddresses(contact);
      if (addresses.length > 0) {
        data.addresses = addresses;
      }
      let socials = this.getContactSocialNetworks(contact);
      if (socials.length > 0) {
        data.social_networks = socials;
      }
      let dates = this.getContactDates(contact);
      if (dates.length > 0) {
        data.dates = dates;
      }

      // TODO: change for person account
      data.account = this.apiService.getAccount();
      aux.data = data;
      // add the generated contact to the list
      this.generatedContacts.push(aux);
      this.generatedContactsBkp = this.generatedContacts;
    }
  }

  /**
   * Get contact phones from imported data
   * @param {any} contact [description]
   */
  private getContactPhones(contact: any) {
    // phones
    let phones = [];
    let fieldArray = ['home_phone', 'work_phone', 'mobile_phone'];
    let typeArray = [this.homePhoneId, this.workPhoneId, this.mobilePhoneId];
    let defaultSet = false;
    for (let i = 0; i < fieldArray.length; i++) {
      if (this.isFieldComplete(contact, fieldArray[i])) {
        // convert phone
        let phone = contact[this.mappedShootQFields[fieldArray[i]]];
        if (this.generalFunctionsService.validatePhone(phone)) {
          // create phone
          let aux = {
            phone_type: typeArray[i],
            number: phone
          };
          if (!defaultSet) {
            aux['default'] = true;
            defaultSet = true;
          }
          phones.push(aux);
        }
      }
    }
    return phones;
  }

  /**
   * Get contact emails from imported data
   * @param {any} contact [description]
   */
  private getContactEmails(contact: any) {
    // emails
    let emails = [];
    let fieldArray = ['home_email', 'work_email'];
    let typeArray = [this.homeEmailId, this.workEmailId];
    let defaultSet = false;
    for (let i = 0; i < fieldArray.length; i++) {
      if (this.isFieldComplete(contact, fieldArray[i])) {
        let aux = {
          email_type: typeArray[i],
          address: contact[this.mappedShootQFields[fieldArray[i]]]
        };
        if (!defaultSet) {
          aux['default'] = true;
          defaultSet = true;
        }
        emails.push(aux);
      }
    }
    return emails;
  }

  /**
   * Get contact addresses from importe data
   * @param {any} contact [description]
   */
  private getContactAddresses(contact: any) {
    // addresses
    let addresses = [];
    // home address
    if (this.homeAddressId !== undefined &&
      this.isFieldComplete(contact, 'home_address_1')
      && this.isFieldComplete(contact, 'home_city')
      && this.isFieldComplete(contact, 'home_zip')
      && this.isFieldComplete(contact, 'home_state')
      && this.isFieldComplete(contact, 'home_country')) {
      let home_address = {
        city: contact[this.mappedShootQFields['home_city']],
        zip: contact[this.mappedShootQFields['home_zip']],
        address1: contact[this.mappedShootQFields['home_address_1']],
        address2: (this.isFieldComplete(contact, 'home_address_2')) ? contact[this.mappedShootQFields['home_address_2']] : undefined,
        state: contact[this.mappedShootQFields['home_state']],
        country: contact[this.mappedShootQFields['home_country']]
      };
      addresses.push(home_address);
    }

    if (this.workAddressId !== undefined &&
      this.isFieldComplete(contact, 'work_address_1')
      && this.isFieldComplete(contact, 'work_city')
      && this.isFieldComplete(contact, 'work_zip')
      && this.isFieldComplete(contact, 'work_state')
      && this.isFieldComplete(contact, 'work_country')) {
      let work_address = {
        city: contact[this.mappedShootQFields['work_city']],
        zip: contact[this.mappedShootQFields['work_zip']],
        address1: contact[this.mappedShootQFields['work_address_1']],
        address2: (this.isFieldComplete(contact, 'work_address_2')) ? contact[this.mappedShootQFields['work_address_2']] : undefined,
        state: contact[this.mappedShootQFields['work_state']],
        country: contact[this.mappedShootQFields['work_country']]
      };
      addresses.push(work_address);
    }
    return addresses;
  }

  /**
   * Get contact social networks from imported data
   * @param {any} contact [description]
   */
  private getContactSocialNetworks(contact: any) {
    let socialNetworks = [];
    let fieldArray = ['facebook', 'twitter', 'instagram', 'website'];
    for (let f of fieldArray) {
      if (this.mappedShootQFields[f] && contact[this.mappedShootQFields[f]] !== '') {
        let a = {
          network_id: contact[this.mappedShootQFields[f]],
          network: f
        };
        socialNetworks.push(a);
      }
    }
    return socialNetworks;
  }

  /**
   * Get contact dates from imported data
   * @param {any} contact [description]
   */
  private getContactDates(contact: any) {
    let dates = [];
    let fieldArray = ['anniversary', 'birthday'];
    let typeArray = [this.anniversaryId, this.birthdayId];
    let formats = this.generalFunctionsService.getDateValidFormats();
    for (let i = 0; i < fieldArray.length; i++) {
      if (this.mappedShootQFields[fieldArray[i]] !== undefined && contact[this.mappedShootQFields[fieldArray[i]]] !== '') {
        let date = contact[this.mappedShootQFields[fieldArray[i]]];
        let momentDate = undefined;
        if (this.moment(date, formats, true).isValid()) {
          momentDate = this.moment(date, formats, true).format('YYYY-MM-DD');
          let aux = {
            date_type: typeArray[i],
            date: momentDate
          };
          dates.push(aux);
        } else {
          this.flash.error('Imported ' + fieldArray[i] + ' date "' + date + '"" format is not supported. Cann\'t be imported');
        }
      }
    }
    return dates;
  }

  /**
   * check if the mapped fields are valid
   * @return {boolean} [description]
   */
  private areFieldValids(): boolean {
    // check for first and last name
    if (this.mappedShootQFieldsList.indexOf('first_name') !== -1 &&
      this.mappedShootQFieldsList.indexOf('last_name') !== -1) {
      return true;
    }
    return false;
  }

  /**
   * unsubscribe the subscribed observables
   */
  private removeSubscription() {
    if (this.isFieldSuscribed && this.fieldSubscriber !== undefined) {
      this.fieldSubscriber.unsubscribe();
    }
    if (this.isCreateSubscribed && this.createSubscriber !== undefined) {
      this.createSubscriber.unsubscribe();
    }
  }

  /**
   * Function to search contacts
   * @param {event} e [description]
   */
  private search(e?: any) {
    if (e && e.keyCode === 27) {
      return false;
    }
    // this.hideShowMore = true;
    this.isLoading = true;
    if (e && e.keyCode === 8 && this.search_box === '') {
      // If user deletes characters and search box is empty, clear contact
      this.searchContacts(this.search_box);
      this.isLoading = false;
    }
    if (this.search_box !== '' && typeof this.search_box !== undefined) {
      this.searchContacts(this.search_box);
      this.isLoading = false;
    }
  }
  /**
   * Function to search contacts.
   */
  private searchContacts(search_box: string) {
    let filteredContacts: Array<any> = [];
    for (let contact of this.generatedContactsBkp) {
      if (contact.data.first_name.toLowerCase().search(search_box.toLowerCase()) !== -1
        || contact.data.last_name.toLowerCase().search(search_box.toLowerCase()) !== -1) {
        filteredContacts.push(contact);
      }
    }
    // Set filteredContacts
    this.generatedContacts = [];
    this.generatedContacts = filteredContacts;
  }

  /**
   * Return the default field
   * @param {string} field [description]
   * @param {any}    c     [description]
   */
  private getDefaultField(field: string, c: any) {
    switch (field) {
      case 'phone':
        if (c.data.phones && c.data.phones !== undefined) {
          for (let p of c.data.phones) {
            if (p.default) {
              return this.generalFunctionsService.formatPhone(p.number);
            }
          }
        }
        break;
      case 'email':
        if (c.data.emails && c.data.emails !== undefined) {
          for (let e of c.data.emails) {
            if (e.default) {
              return e.address;
            }
          }
        }
        break;
      default:
    }
  }

  /**
   * Paginator handle page change
   * perform the logic to update the page
   * @param {any} e [description]
   */
  private handlePageChange(e: any) {
    this.paginator.currentPage = e.page;
    this.paginator.perPage = e.perPage;
    this.paginator.first = e.perPage * (e.page - 1);
    this.paginator.last = this.paginator.first + e.perPage - 1;
  }

  /**
   * Set contact type id for a single contact
   * @param {[type]} contact [description]
   * @param {[type]} event   [description]
   */
  private setContactType(contact, id) {
    contact.typeId = id;
    if (id === 0) {
      contact.data.contact_types = undefined;
    } else {
      contact.data.contact_types = [id];
    }
    if (this.isChecked(contact.id)) {
      this.checkContactType(contact);
    }
  }

  /**
   * Set the globalc contact type id, used on bulk select
   * @param {[type]} event [description]
   */
  private bulkSelectContactType(id) {
    this.bulkContactTypeId = id;
  }

  /**
   * Update paginator displayed pages depends on window width
   */
  private updatePaginatorMaxSize() {
    if (this.innerWidth < 930) {
      this.paginator.maxSize = 3;
    } else if (this.innerWidth >= 930 && this.innerWidth < 1120) {
      this.paginator.maxSize = 2;
    } else if (this.innerWidth >= 1120 && this.innerWidth < 1340) {
      this.paginator.maxSize = 3;
    } else if (this.innerWidth >= 1340) {
      this.paginator.maxSize = 5;
    }
  }
  /**
   * Function to validate phone.
   * @param {string} phone [description]
   */
  private formatPhone(phone: string) {
    // remove characters leave only numbers
    if (this.generalFunctionsService.validatePhone(phone)) {
      return phone;
    } else {
      this.flash.error(`The phone ${phone} has an invalid format, it can't be imported`);
      return '';
    }
  }

  /**
   * check if a field is complete and is not an empty string
   * @param {any}    contact [description]
   * @param {string} field   [description]
   */
  private isFieldComplete(contact: any, field: string) {
    return (this.mappedShootQFields[field] && contact[this.mappedShootQFields[field]] !== '');
  }
  /**
   * open the dialog box to load the csv file
   * @param {any} e [description]
   */
  private openDialog(e: any) {
    document.getElementById('input-file').click();
  }

  private checkContactType(contact: any) {
    if (contact.typeId === 0) {
      contact.alertContactType = true;
    } else {
      contact.alertContactType = false;
    }
  }
}
