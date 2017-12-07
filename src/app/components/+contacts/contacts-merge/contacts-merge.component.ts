import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ViewChild,
  ViewEncapsulation
}                                         from '@angular/core';
import { Router, ActivatedRoute }         from '@angular/router';
import { Observable }                     from 'rxjs/Observable';
/* Services */
import { ContactService }                 from '../../../services/contact/contact.service';
import { FlashMessageService }            from '../../../services/flash-message';
import { GeneralFunctionsService }        from '../../../services/general-functions';
import { EmailTypeService }               from '../../../services/email-type/email-type.service';
import { PhoneTypeService }               from '../../../services/phone-type/phone-type.service';
import { BreadcrumbService }              from '../../../components/shared/breadcrumb/components/breadcrumb.service';
import { DateService }                    from '../../../services/date/date.service';
import { ModalService }                   from '../../../services/modal/';
import { ModalDirective }                 from 'ngx-bootstrap';
/* Models */
import { Contact }                        from '../../../models/contact';
/* Pipes */
import { CapitalizePipe }                 from '../../../pipes/capitalize/capitalize.pipe';

declare let require: (any);

@Component({
  selector: 'contacts-merge',
  templateUrl: './contacts-merge.component.html',
  styleUrls: ['./contacts-merge.component.scss'],
  providers: [
    GeneralFunctionsService,
    EmailTypeService,
    PhoneTypeService,
    DateService,
    CapitalizePipe
  ],
  encapsulation: ViewEncapsulation.None
})
export class ContactsMergeComponent {
  @ViewChild('saveSettingModal') public saveSettingModal: ModalDirective;
  @Input() id1;
  @Input() id2;
  @Input() redirectTo: string = 'dashboard';
  @Output() closeModal = new EventEmitter();
  public _ = require('../../../../../node_modules/lodash');
  private generalFunctions;
  private model1 = new Contact();
  private model2 = new Contact();
  private aux1 = new Contact();
  private aux2 = new Contact();
  private contacts: Contact[];
  private componentRef;
  private router: Router; // Router object, with this we can call navigate function.
  private activatedRoute: ActivatedRoute; // Routes url params extractor.
  private subscriber;
  private visibleFields: Array<string>;
  private emailTypes;
  private phoneTypes;
  private contactTypes;
  private dateTypes;
  private alertify = require('../../../assets/theme/assets/vendor/alertify-js/alertify.js');
  private lftDisabled: Array<any> = [];
  private rgtDisabled: Array<any> = [];
  private requestObject: Object = {};
  private inputKeysHidden: Array<string> = [];
  private showContactPanels: boolean = false;
  private showAllFields: boolean = false;
  private existEquals: boolean = false;
  private isLoading: boolean = false;
  private fieldsOrder = [
    'contact_types',
    'first_name',
    'last_name',
    'maiden_name',
    'dates',
    'phones',
    'emails',
    'social_networks',
    'addresses',
    'equal_contact_types',
    'equal_first_name',
    'equal_last_name',
    'equal_maiden_name',
    'equal_dates',
    'equal_phones',
    'equal_emails',
    'equal_social_networks',
    'equal_addresses'
  ];

  private model1FirstName = '';
  private model1LastName = '';
  private model2FirstName = '';
  private model2LastName = '';
  private equalContacts: boolean = false;
  private notSelect: Array<string> = [];

  constructor(
    private breadcrumbService:             BreadcrumbService,
    private contactService:                ContactService,
    private flash:                         FlashMessageService,
    private generalFunctionsService:       GeneralFunctionsService,
    private emailTypeService:              EmailTypeService,
    private phoneTypeService:              PhoneTypeService,
    private dateService:                   DateService,
    private modalService:                  ModalService,
    private capitalizePipe:                CapitalizePipe,
    _router:                               Router,
    activatedRoute:                        ActivatedRoute
  ) { this.generalFunctions = generalFunctionsService;
      this.emailTypeService = emailTypeService;
      this.phoneTypeService = phoneTypeService;
      this.visibleFields = [
        'first_name',
        'last_name',
        'maiden_name',
        'contact_type', // virtual field without 's'
        'birthday', // virtual field
        'anniversary', // virtual field
        'home_address', // virtual field
        'work_address', // virtual field
        'work_email', // virtual field
        'home_email', // virtual field
        'mobile_phone', // virtual field
        'work_phone', // virtual field
        'home_phone', // virtual field
        'facebook', // virtual field
        'twitter', // virtual field
        'instagram', // virtual field
        'website' // virtual field
      ];
      this.inputKeysHidden = [
        'id',
        'equal'
      ];
  this.router = _router;
    this.activatedRoute = activatedRoute;
      breadcrumbService.addFriendlyNameForRoute('/contacts/merge', 'Merge');
  }

  ngOnInit() {
    let body = document.getElementsByTagName('body')[0];
    body.classList.add('openOldModal');
    body.classList.add('modalContactMerge');

    let observableArray = [];
    observableArray.push(this.emailTypeService.getList());
    observableArray.push(this.phoneTypeService.getList());
    observableArray.push(this.dateService.getTypes());
    observableArray.push(this.contactService.getRequestContactTypes());

    Observable.forkJoin(observableArray)
      .subscribe(data => {
        if (data.length === 5) {
          if (data[0] && data[0]['results'] !== undefined) {
            this.emailTypes = data[0]['results'];
          }
          if (data[1] && data[1]['results'] !== undefined) {
            this.phoneTypes = data[1]['results'];
          }
          if (data[2] && data[2]['results'] !== undefined) {
            this.dateTypes = data[2]['results'];
          }
          if (data[3] !== undefined) {
            this.contactTypes = data[3];
          }
        }
        if (this.id1 !== undefined && this.id2 !== undefined) {
          this.contactService.getContact(this.id1).subscribe(contact1 => {
            if (typeof contact1 !== undefined) {
              this.aux1 = this.formatContactObject(contact1, this.emailTypes, this.phoneTypes);
            }
            this.contactService.getContact(this.id2).subscribe(contact2 => {
              if (typeof contact2 !== undefined) {
                this.aux2 = this.formatContactObject(contact2, this.emailTypes, this.phoneTypes);
              }
              if (this.aux1.archived) {
                this.flash.error(`The contact ${this.capitalizeString(this.aux1.first_name[0]['first_name'])} ${this.capitalizeString(this.aux1.last_name[0]['last_name'])} doesn't exist`);
                this.cancel();
                return;
              } else if (this.aux2.archived) {
                this.flash.error(`The contact ${this.capitalizeString(this.aux1.first_name[0]['first_name'])} ${this.capitalizeString(this.aux1.last_name[0]['last_name'])} doesn't exist`);
                this.cancel();
                return;
              }
              this.initializeEqualEntities();
              this.matchModelsFields();
              this.checkEquals();
              this.sortContactFields();
              this.model1 = this.aux1;
              this.model2 = this.aux2;
              this.showContactPanels = true;
            });
          });
        } else {
          this.flash.error('There is an error');
        }
      },
      err => console.error(err)
    );
  }
  /**
   * Initialize arrays to store the equal elements and show them at the bottom list
   */
  public initializeEqualEntities() {
    this.aux1.equal_contact_types = [];
    this.aux1.equal_first_name = [];
    this.aux1.equal_last_name = [];
    this.aux1.equal_maiden_name = [];
    this.aux1.equal_addresses = [];
    this.aux1.equal_dates = [];
    this.aux1.equal_emails = [];
    this.aux1.equal_phones = [];
    this.aux1.equal_social_networks = [];

    this.aux2.equal_contact_types = [];
    this.aux2.equal_first_name = [];
    this.aux2.equal_last_name = [];
    this.aux2.equal_maiden_name = [];
    this.aux2.equal_addresses = [];
    this.aux2.equal_dates = [];
    this.aux2.equal_emails = [];
    this.aux2.equal_phones = [];
    this.aux2.equal_social_networks = [];
  }
  /**
   * Sort emails, phones, addresses, social by type and then for value
   */
  public sortEntityData() {
    // sort the internal data of dates, phones, emails, addresses, social networks
    // sort dates
    this.aux1.dates = this._.sortBy(this.aux1.dates, ['date_type', 'date']);
    this.aux2.dates = this._.sortBy(this.aux2.dates, ['date_type', 'date']);
    // sort addresses
    this.aux1.addresses = this._.sortBy(this.aux1.addresses, ['full_address']);
    this.aux2.addresses = this._.sortBy(this.aux2.addresses, ['full_address']);
    // sort phones
    this.aux1.phones = this._.sortBy(this.aux1.phones, ['phone_type', 'number']);
    this.aux2.phones = this._.sortBy(this.aux2.phones, ['phone_type', 'number']);
    // sort emails
    this.aux1.emails = this._.sortBy(this.aux1.emails, ['email_type', 'address']);
    this.aux2.emails = this._.sortBy(this.aux2.emails, ['email_type', 'address']);
    // sort social networs
    this.aux1.social_networks = this._.sortBy(this.aux1.social_networks, [function(social) { return social.network; }]);
    this.aux2.social_networks = this._.sortBy(this.aux2.social_networks, [function(social) { return social.network; }]);
  }
  /**
   * Sort contact fields (only the keys, not its internal data), by determinated order on this.fieldsOrder[]
   */
  public sortContactFields() {
    // we must to convert the object this.aux1/this.aux2 into an array of objects,
    // so, _.sortBy keep the Contact object structure
    // if we don't do that, _.sortBy will return an ordered array[], not the ordered Contact object
    let c1 = [];
    let c2 = [];
    // convert this.aux1 into c1: Array<Object>
    for (let key in this.aux1) {
      if (this.aux1.hasOwnProperty(key)) {
        if (this.aux1[key] !== null && (typeof this.aux1[key] === 'array' || this.isObject(this.aux1[key]))) {
          let idx = this.fieldsOrder.indexOf(key);
          if (idx >= 0) {
            this.aux1[key].index = idx;
            let obj = {
              [key]: this.aux1[key],
              'index': idx
            };
            c1.push(obj);
          }
        }
      }
    }
    // convert this.aux2 into c2: Array<Object>
    for (let key in this.aux2) {
      if (this.aux2.hasOwnProperty(key)) {
        if (this.aux2[key] !== null && (typeof this.aux2[key] === 'array' || this.isObject(this.aux2[key]))) {
          let idx = this.fieldsOrder.indexOf(key);
          if (idx >= 0) {
            this.aux2[key].index = idx;
            let obj = {
              [key]: this.aux2[key],
              'index': idx
            };
            c2.push(obj);
          }
        }
      }
    }
    // sort contact1 by index field
    c1 = this._.sortBy(c1, [function(field) {
      if (field !== undefined && field !== null && field.hasOwnProperty('index')) {
        return field.index;
      } else {
        return 0;
      }
    }]);
    // sort contact2 by index field
    c2 = this._.sortBy(c2, [function(field) {
      if (field !== undefined && field !== null && field.hasOwnProperty('index')) {
        return field.index;
      } else {
        return 0;
      }
    }]);
    let c1final = {};
    let c2final = {};
    // restore the contact1 that was an Array<object> to Contact Object
    for (let obj of c1) {
      for (let key in obj) {
        if (obj.hasOwnProperty(key) && typeof this.isObject(obj[key])) {
          c1final[key] = obj[key];
        }
      }
    }
    // restore the contact2 that was an Array<object> to Contact Object
    for (let obj of c2) {
      for (let key in obj) {
        if (obj.hasOwnProperty(key) && typeof this.isObject(obj[key])) {
          c2final[key] = obj[key];
        }
      }
    }
    this.aux1 = c1final as Contact;
    this.aux2 = c2final as Contact;

    // check first name for model1 to show on top label
    if (this.aux1.first_name && this.aux1.first_name.length) {
      this.model1FirstName = this.aux1.first_name[0]['first_name'];
    } else if (this.aux1.equal_first_name && this.aux1.equal_first_name.length) {
      this.model1FirstName = this.aux1.equal_first_name[0]['first_name'];
    }
    // check last name for model1 to show on top label
    if (this.aux1.last_name && this.aux1.last_name.length) {
      this.model1LastName = this.aux1.last_name[0]['last_name'];
    } else if (this.aux1.equal_last_name && this.aux1.equal_last_name.length) {
      this.model1LastName = this.aux1.equal_last_name[0]['last_name'];
    }

    // check first name for model2 to show on top label
    if (this.aux2.first_name && this.aux2.first_name.length) {
      this.model2FirstName = this.aux2.first_name[0]['first_name'];
    } else if (this.aux2.equal_first_name && this.aux2.equal_first_name.length) {
      this.model2FirstName = this.aux2.equal_first_name[0]['first_name'];
    }
    // check last name for model2 to show on top label
    if (this.aux2.last_name && this.aux2.last_name.length) {
      this.model2LastName = this.aux2.last_name[0]['last_name'];
    } else if (this.aux2.equal_last_name && this.aux2.equal_last_name.length) {
      this.model2LastName = this.aux2.equal_last_name[0]['last_name'];
    }
  }
  /**
   * Check amount of each fields on both contacts to match the quantities
   */
  public matchModelsFields() {
    // match dates quantity
    this.checkQuantities(this.aux1, this.aux2, 'dates', 'date', 'date', this.dateTypes);
    this.checkQuantities(this.aux2, this.aux1, 'dates', 'date', 'date', this.dateTypes);
    // match phones quantity
    this.checkQuantities(this.aux1, this.aux2, 'phones', 'phone', 'number', this.phoneTypes);
    this.checkQuantities(this.aux2, this.aux1, 'phones', 'phone', 'number', this.phoneTypes);
    // match email quantity
    this.checkQuantities(this.aux1, this.aux2, 'emails', 'email', 'address', this.emailTypes);
    this.checkQuantities(this.aux2, this.aux1, 'emails', 'email', 'address', this.emailTypes);
    // match addresses quantity
    this.checkQuantities(this.aux1, this.aux2, 'addresses', 'address', 'address1', []);
    this.checkQuantities(this.aux2, this.aux1, 'addresses', 'address', 'address1', []);
    // match social networks quantity
    this.checkQuantities(this.aux1, this.aux2, 'social_networks', 'network', 'network_id', undefined);
    this.checkQuantities(this.aux2, this.aux1, 'social_networks', 'network', 'network_id', undefined);
    this.sortEntityData();
  }
  /**
   * Check each contact and match the same quantity of home phones, work phones, home emails, work emails, social, etc
   * @param {Contact} obj1 [Contact to merge on]
   * @param {Contact} obj2 [Contact]
   * @param {string} key [name of the array key that contains the data to check. Ex: 'phones']
   * @param {string} entity [individual entity. Ex: 'phone']
   * @param {string} field [name of the field that the 'empty' fields needs to be inserted. Ex: 'number']
   * @param {Array} types [Array of types. Ex: 'this.phoneTypes']
   */
  public checkQuantities(obj1: Contact, obj2: Contact, key: string, entity: string, field: string, types: Array<any>) {
    let ids1 = []; let ids2 = [];
    let res1 = null;
    let res2 = null;
    if (entity !== 'network') {
      res1 = this._.groupBy(obj1[key], entity + '_type');
      res2 = this._.groupBy(obj2[key], entity + '_type');
    } else {
      res1 = this._.groupBy(obj1[key], entity);
      res2 = this._.groupBy(obj2[key], entity);
    }
    // example: res1 = [{amount: 2, id: "1"}, {amount: 1, id: "2"}]
    for (let key1 in res1) {
      if (res1[key1]) {
        ids1.push({id: key1, amount: res1[key1].length});
      }
    }
    // example: res2 = [{amount: 1, id: "2"}]
    for (let key2 in res2) {
      if (res2[key2]) {
        ids2.push({id: key2, amount: res2[key2].length});
      }
    }
    // check fields to create emtpy data, when one contact has an entity and the other doesn't
    // for example, if one contact has two Home Phones and the other just one,
    // then an empty Home Phone is created on the second
    for (let i = 0; i < ids1.length; i++) {
      let found = false;
      let id = ids1[i].id;
      // network has string id
      if (entity !== 'network' && typeof ids1[i].id === 'string') {
        id = parseInt(ids1[i].id, 10);
      }
      for (let j = 0; j < ids2.length; j++) {
        if (ids1[i].id === ids2[j].id) {
          found = true;
          let type_name = id;
          let missing = 0;
          if (entity !== 'network') {
            type_name = this.extractData(types, id);
          }
          if (ids1[i].amount > ids2[j].amount) {
            missing = ids1[i].amount - ids2[j].amount;
            this.insertEmptyField(obj2, key, type_name, id, entity, field, missing);
          } else if (ids1[i].amount < ids2[j].amount) {
            missing = ids2[j].amount - ids1[i].amount;
            this.insertEmptyField(obj1, key, type_name, id, entity, field, missing);
          }
        }
      }
      if (!found) {
        let type_name = id;
        if (entity !== 'network') {
          type_name = this.extractData(types, id);
        }
        this.insertEmptyField(obj2, key, type_name, id, entity, field, ids1[i].amount);
      }
    }
    // check fields to create empty data on fields that both contacts don't have info
    this.createEmptyDataOnBothContacts(ids1, ids2, key, entity, field, types);
  }
  /**
   * Create empty data on fields that both contacts don't have info
   *
   * @param {Array} ids1 [count of elements grouped by type id on Aux1.]
   * Ex: ids1 = [{amount: 2, id: "1"}, {amount: 1, id: "2"}]
   * @param {Array} ids2 [count of elements grouped by type id on Aux2.
   * @param {string} key [name of the array key that contains the data to check. Ex: 'phones']
   * @param {string} entity [individual entity. Ex: 'phone']
   * @param {string} field [name of the field that the 'empty' fields needs to be inserted. Ex: 'number']
   * @param {Array} types [Array of types]
   */
  public createEmptyDataOnBothContacts(ids1: Array<any>, ids2: Array<any>, key: string, entity: string,
    field: string, types: Array<any>) {
    if (types !== undefined) {
      for (let type of types) {
        let id1 = this._.find(ids1, function(idData) { return idData.id === String(type.id); });
        if (id1 === undefined) {
          let id2 = this._.find(ids2, function(idData) { return idData.id === String(type.id); });
          if (id2 === undefined) {
            let type_name = this.extractData(types, type.id);
            this.insertEmptyField(this.aux1, key, type_name, type.id, entity, field, 1);
            this.insertEmptyField(this.aux2, key, type_name, type.id, entity, field, 1);
          }
        }
      }
    } else if (key === 'social_networks') {
      let social_ids = ['facebook', 'twitter', 'instagram', 'website'];
      for (let social_id of social_ids) {
        let id1 = this._.find(this._.cloneDeep(ids1), function(idData) { return String(idData.id).toLowerCase() === String(social_id); });
        if (id1 === undefined) {
          let id2 = this._.find(this._.cloneDeep(ids2), function(idData) { return String(idData.id).toLowerCase() === String(social_id); });
          if (id2 === undefined) {
            this.insertEmptyField(this.aux1, key, social_id, social_id, entity, field, 1);
            this.insertEmptyField(this.aux2, key, social_id, social_id, entity, field, 1);
          }
        }
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
  /**
   * Function wrapper to navigate to a new url.
   * @param {[type]} param [description]
   */
  public navigateTo(param) {
    this.generalFunctions.navigateTo(param);
  }
  /**
   * Function to check for an object.
   * @param {[type]} item [description]
   */
  public isObject(item) {
    return this.generalFunctions.isObject(item);
  }
  /**
   * Function to check for array.
   * @param {[type]} key [description]
   */
  public inArray(key) {
    return this.generalFunctions.inArray(this.visibleFields, key);
  }

  public isArray(item) {
    return this.generalFunctions.typeOf(item) === 'array';
  }
  /**
   * Function to format contact object in order to present data to the user
   * and add virtual fields to easily show the information to the user.
   *
   * @param  {Contact} mObj       The main Object from the API.
   * @param  {type}  emailTypes The Email Types Object from the API.
   * @param  {type}  phoneTypes The Phone Types Object from the API.
   * @return {Contact} The contact model with virtual fields added.
   */
  public formatContactObject(mObj: Contact, emailTypes, phoneTypes): Contact {
    if (this.generalFunctions.isObject(mObj) === true) {
      let key: any;
      let key2: any;
      let type_name: string;
      if (typeof mObj === undefined) {
        this.flash.error('The Contact could not be loaded');
      }
      for (key in mObj) {
        if (mObj.hasOwnProperty(key)) {
          if (this.generalFunctions.typeOf(mObj[key]) === 'array') {
            if (mObj[key] != null && typeof mObj[key] !== undefined) {
              for (let i = 0; i < mObj[key].length; i++) {
                for (key2 in mObj[key][i]) {
                  if (mObj[key][i].hasOwnProperty(key2)) {
                    if (key2 === 'address_type') {
                      let components = [mObj[key][i].address1,
                                        mObj[key][i].address2,
                                        mObj[key][i].city,
                                        mObj[key][i].state,
                                        mObj[key][i].country,
                                        mObj[key][i].zip
                                      ];
                      mObj[key][i][`address`] = {
                        'full_address': this._.compact(components).join(', '),
                        'address1': mObj[key][i].address1,
                        'address2': mObj[key][i].address2,
                        'city': mObj[key][i].city,
                        'state': mObj[key][i].state,
                        'country': mObj[key][i].country,
                        'zip': mObj[key][i].zip,
                        'id': mObj[key][i].id,
                        'equal': false
                      };
                    }
                    if (key2 === 'email_type') {
                      type_name = this.extractData(emailTypes, mObj[key][i][key2]);
                      mObj[key][i][`${type_name}_email`] = {
                        'address': mObj[key][i].address,
                        'id': mObj[key][i].id,
                        'equal': false
                      };
                    }
                    if (key2 === 'phone_type') {
                      type_name = this.extractData(phoneTypes, mObj[key][i][key2]);
                      mObj[key][i][`${type_name}_phone`] = {
                        'number': mObj[key][i].number,
                        'id': mObj[key][i].id,
                        'equal': false
                      };
                    }
                    if (key2 === 'network') {
                      mObj[key][i][mObj[key][i]['network']] = {
                        'network_id': mObj[key][i].network_id,
                        'id': mObj[key][i].id,
                        'equal': false
                      };
                    }
                  }
                }
              }
              if (key === 'contact_types') {
                let types = [];
                let ids = [];
                for (let i = 0; i < mObj[key].length; i++) {
                  let type = this.extractData(this.contactTypes, mObj[key][i]);
                  if (type) {
                    types.push(type);
                    ids.push(mObj[key][i]);
                  }
                }
                let finalTypes = '[empty]';
                if (types.length > 0) {
                  finalTypes = this._.compact(types).join(', ');
                }
                mObj[key] = [];
                let obj = {
                  contact_type: {
                    types: finalTypes,
                    'equal': false
                  }
                };
                if (ids.length) {
                  obj['contact_type']['id'] = ids;
                }
                mObj[key].push(obj);
              }
              if (key === 'dates') {
                if (mObj[key].length > 0) {
                  for (let i = 0; i < mObj[key].length; i++) {
                    let type = this.extractData(this.dateTypes, mObj[key][i].date_type);
                    if (type) {
                      mObj[key][i][type] = {
                        date: mObj[key][i].date,
                        id: mObj[key][i].id,
                        'equal': false,
                      };
                    }
                  }
                }
              }
            }
          } else {
            if (key === 'first_name' || key === 'last_name' || key === 'maiden_name') {
              mObj[key] = [{
                [key]: mObj[key] || '[empty]',
                'equal': false,
              }];
            }
          }
        }
      }
      return mObj;
    } else {
      this.flash.error('The Contact could not be loaded');
    }
  }
  /**
   * Inserts an empty field with the specified values, to show the same amount of fields on both contacts.
   * This way, the fields with same type of both contacts, will be shown on the same row
   *
   * @param {Contact} c  [description].
   * @param {string}  key [key name from the array to insert new field. Ex: 'phones'].
   * @param {string}  type [type name from the new field. Ex: 'home'].
   * @param {any}     typeId [type id].
   * @param {string}  entity [individual entity. Ex: 'phone'].
   * @param {string}  field [field name to insert the 'empty' value. Ex: 'number'].
   * @param {number}  amount [number of new 'empty' fields needs to be inserted for this type].
   */
  public insertEmptyField(c: Contact, key: string, type: string, typeId: any, entity: string, field: string, amount: number) {
    let aux = {};
    if (entity === 'network' || entity === 'date') {
      aux[`${type}`] = {
        [field]: '[empty]',
        'equal': false
      };
      if (entity === 'date') {
        aux[`${entity}_type`] = typeId;
      } else {
        aux[`${entity}`] = typeId;
      }
    } else {
      aux[`${type}_${entity}`] = {
       [field]: '[empty]',
       'equal': false
      };
      aux[`${entity}_type`] = typeId;
    }
    if (this.generalFunctions.typeOf(c[key]) === 'array') {
      for (let i = 0; i < amount; i++) {
        c[key].push(aux);
      }
    }
  }
  /**
   * Check if the contacts have the same quantity of phones, emails, social, etc, grouped by type
   *
   */
  public checkEquals() {
    this.checkEntityEquals(this.dateTypes, 'dates', 'date', 'date');
    this.checkEntityEquals(this.phoneTypes, 'phones', 'phone', 'number');
    this.checkEntityEquals(this.emailTypes, 'emails', 'email', 'address');
    this.checkEntityEquals(this.contactTypes, 'contact_types', 'contact_type', 'types');
    this.checkEntityEquals(undefined, 'social_networks', 'network', 'network_id');
    // check if first_name, last_name and maiden_name are equals
    let nameFields = ['first_name', 'last_name', 'maiden_name'];
    for (let i = 0; i < nameFields.length; i++) {
      if (this.aux1[nameFields[i]] && this.isObject(this.aux1[nameFields[i]]) && this.aux1[nameFields[i]].length &&
        this.aux2[nameFields[i]] && this.isObject(this.aux2[nameFields[i]]) && this.aux2[nameFields[i]].length) {
          if (this.aux1[nameFields[i]][0][nameFields[i]] === this.aux2[nameFields[i]][0][nameFields[i]]) {
            this.aux1[nameFields[i]][0].equal = true;
            this.aux2[nameFields[i]][0].equal = true;
            this.existEquals = true;
            // save field on final contact structure
            let model = {
              key: nameFields[i],
              value: this.aux1[nameFields[i]][0][nameFields[i]]
            };
            this.storeSelectionForRequest(model, i);
            this.aux1[`equal_${nameFields[i]}`].push(this.aux1[nameFields[i]][0]);
            this.aux2[`equal_${nameFields[i]}`].push(this.aux2[nameFields[i]][0]);
            this.aux1[nameFields[i]].splice(0, 1);
            this.aux2[nameFields[i]].splice(0, 1);
          }
      }
    }
    // check if the contacts are exactly equals, then the main arrays must be empty
    let fieldsToCheck = [
      'contact_types',
      'first_name',
      'last_name',
      'maiden_name',
      'dates',
      'phones',
      'emails',
      'social_networks',
      'addresses'
    ];
    let allEquals = true;
    for (let i = 0; i < fieldsToCheck.length; i++) {
      if ((this.aux1[fieldsToCheck[i]] && this.aux1[fieldsToCheck[i]].length > 0) ||
        (this.aux2[fieldsToCheck[i]] && this.aux2[fieldsToCheck[i]].length > 0)) {
        allEquals = false;
      }
    }
    this.equalContacts = allEquals;
  }
  /**
   * Check if two fields are equal and set 'equal' = true on entity data
   * @param {Array} types [types of the entity. Ex: this.phoneTypes]
   * @param {string} entity [entity to check. Ex: 'phones']
   * @param {string} name [individual entity name. Ex: 'phone']
   * @param {string} checkField [field name to check the equality. Ex: 'number']
   */
  public checkEntityEquals(types: Array<any>, entity: string, name: string, checkField: string) {
    let length = 0;
    let idxToDelete = [];
    if (this.aux1[entity].length > this.aux2[entity].length) {
      length = this.aux1[entity].length;
    } else {
      length = this.aux2[entity].length;
    }

    for (let i = 0; i < length; i++) {
      let data1 = null;
      let data2 = null;
      let type_name1 = null;
      let type_name2 = null;
      let model = {key: null, value: null};
      if (name !== 'network' && name !== 'contact_type') {
        type_name1 = this.extractData(types, this.aux1[entity][i][`${name}_type`]);
        type_name2 = this.extractData(types, this.aux2[entity][i][`${name}_type`]);
        if (name === 'date') {
          data1 = this.aux1[entity][i][`${type_name1}`];
          data2 = this.aux2[entity][i][`${type_name2}`];
          model.key = `${type_name1}`;
        } else {
          data1 = this.aux1[entity][i][`${type_name1}_${name}`];
          data2 = this.aux2[entity][i][`${type_name2}_${name}`];
          model.key = `${type_name1}_${name}`;
        }
      } else if (name === 'contact_type' && this.aux1[entity]) {
        data1 = this.aux1[entity][0][name];
        data2 = this.aux2[entity][0][name];
        model.key = name;
      } else {
        data1 = this.aux1[entity][i][this.aux1[entity][i][name]];
        data2 = this.aux2[entity][i][this.aux2[entity][i][name]];
        model.key = this.aux1[entity][i][name];
      }
      if (data1 && data2 && data1[checkField] === data2[checkField]) {
        data1.equal = true;
        data2.equal = true;
        this.existEquals = true;
        // save field on final contact structure
        model.value = data1;
        this.storeSelectionForRequest(model, i);
        this.aux1[`equal_${entity}`].push(this.aux1[entity][i]);
        this.aux2[`equal_${entity}`].push(this.aux2[entity][i]);
        idxToDelete.push(i);
      }
    }
    for (let i = idxToDelete.length - 1; i >= 0; i--) {
      this.aux1[entity].splice(idxToDelete[i], 1);
      this.aux2[entity].splice(idxToDelete[i], 1);
    }
  }
  /**
   * Funciton that handle checkbox behavior, when the user select an item in one model
   * of the two compared the other checkbox is automatically unchecked.
   *
   * @param {string} side  left/right (model evaluated).
   * @param {Object} model The item object.
   * @param {number} index The ngFor index to match the child item in contact object or sub object.
   * @param {event} e The event triggered.
   */
  public checkProperty(side: string, model: any, index: number) {
    if (side === 'right') {
      this.rgtDisabled[`${model.key}_${index}`] = !this.rgtDisabled[`${model.key}_${index}`];
      this.lftDisabled[`${model.key}_${index}`] = false;
      if (!this.rgtDisabled[`${model.key}_${index}`]) {
        this.storeSelectionForRequest(model, index, true);
      } else {
        this.storeSelectionForRequest(model, index);
      }
    } else {
      this.lftDisabled[`${model.key}_${index}`] = !this.lftDisabled[`${model.key}_${index}`];
      this.rgtDisabled[`${model.key}_${index}`] = false;
      if (!this.lftDisabled[`${model.key}_${index}`]) {
        this.storeSelectionForRequest(model, index, true);
      } else {
        this.storeSelectionForRequest(model, index);
      }
    }
  }
  /**
   * It works by selecting all the elements on one side at a time,
   * unselected on the other side if required.
   *
   * @param {string} side  left/right (model evaluated).
   * @param {Object} model The item object.
   * @param {number} index The ngFor index to match the child item in contact object or sub object.
   */
  public checkPropertyAll(side: string, model: any, index: number) {
    if (side === 'right') {
      this.rgtDisabled[`${model.key}_${index}`] = true;
      this.lftDisabled[`${model.key}_${index}`] = false;
      this.storeSelectionForRequest(model, index);
    } else {
      this.lftDisabled[`${model.key}_${index}`] = true;
      this.rgtDisabled[`${model.key}_${index}`] = false;
      this.storeSelectionForRequest(model, index);
    }
  }
  /**
   * Function to make request object when the user selects a checkbox.
   *
   * @param {Object} model The item object.
   * @param {number} index The ngFor index to match the child item in contact object or sub object.
   * @param {boolean} remove If the value must to be removed from the request object
   */
  public storeSelectionForRequest(model, index, remove?: boolean) {
    if (remove !== undefined && remove && this.requestObject.hasOwnProperty(`${model.key}_${index}`)) {
      delete this.requestObject[`${model.key}_${index}`];
    } else {
      this.requestObject[`${model.key}_${index}`] = model.value;
    }
  }
  /**
   * Function to get input type depending on the key.
   *
   * @param {string} key the model key.
   */
  public getInputType(key) {
    return (this.generalFunctions.inArray(this.inputKeysHidden, key) ? 'hidden' : 'text');
  }
  /**
   * Function to check if the item is checked or not
   *
   * @param {string} side  left/right (model evaluated).
   * @param {Object} model The item object.
   * @param {number} index The ngFor index to match the child item in contact object or sub object.
   * @return {boolean}     true/false (disabled/enabled).
   */
  public getModelItemChecked(side: string, model: any, index: number): boolean {
    if (model.key) {
      try {
        if (this.lftDisabled[`${model.key}_${index}`] !== undefined && this.rgtDisabled[`${model.key}_${index}`] !== undefined) {
          return (side === 'right') ? this.rgtDisabled[`${model.key}_${index}`] : this.lftDisabled[`${model.key}_${index}`];
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
  /**
   * Function to perform the contacts merge.
   *
   * @param {event} e the event that fires this function.
   */
  public doMerge(e) {
    e.preventDefault();
    this.saveSettingModal.hide();
    let mergeObj = this.parseAndMakeRequestObject();
    if (mergeObj !== false) {
      this.isLoading = true;
      this.contactService.doMerge(this.id1, this.id2, mergeObj)
        .subscribe(response => {
          this.closeModal.emit({ action: 'close-modal' });
          this.router.navigate(['contacts']);
          this.flash.success('Contacts have been merged.');
          this.isLoading = false;
        },
        err => {
          this.flash.error('An error has occurred merging contacts.');
          this.isLoading = false;
          console.error(err);
          setTimeout(() => {
            // restore the modal-open class on the body, if not the vertical scrollbar is hidden when cancel is pressed
            let body = document.getElementsByTagName('body')[0];
            body.classList.add('modal-open');
          }, 300);
        },
        () => {
          this.isLoading = false;
        }
      );
    }
  }

  /**
   * Close modal without saving modifications
   *
   */
  public cancel() {
    this.router.navigate([this.redirectTo]);
    this.closeModal.emit({ action: 'close-modal' });
  }
  /**
   * Verifies that all items are selected before calling the function that saves the changes.
   */
  private clickMerge() {
    this.notSelect = [];
    if (this.validateSelection()) {
      this.saveSettingModal.show();
    } else {
      this.flash.error('You must select a value for each field');
    }
  }
  /**
   * Extract data from object.
   *
   * @param {Object} data    the data to be parsed.
   * @param {number} type_id phone, email, address ids related to the entity object.
   * @return {string} the slug name of the entity.
   */
  private extractData(data: Array<any>, type_id: number): string {
    if (data !== undefined) {
      for (let j = 0; j < data.length; j++) {
        if (data[j].id === type_id && data[j].account === 1) {
          return data[j].slug;
        }
      }
    }
  }
  /**
   * Function to parse and format object to send to merge request.
   *
   * @return {Object} [description]
   */
  private parseAndMakeRequestObject(): Object {
    // 1 - Check if value is object
    //   a - Get the key (email, phone, address, social).
    //   b - Search for id
    //   c - put the id in the array.
    // 2 - If value is not an object (string instead)
    //   a - use same key (removing _id)
    //   b - put new key with the value in the object.
    let parsedObject = {'other_contact_id': null, 'field_data': {'defaults': {}}};
    let patternAdditionalInfo = 'email|phone|address|social|date|contact_type';
    let patternSocialInfo = 'instagram|facebook|twitter|website';
    let patternMainContactKeys = 'first_name|last_name|maiden_name';
    let patternDateInfo = 'birthday|anniversary';
    let patternContactType = 'contact_types';
    let emailArr = [];
    let phoneArr = [];
    let addressArr = [];
    let socialArr = [];
    let dateArr = [];
    let contactTypeArr = [];
    // Assign the other person id.
    parsedObject.other_contact_id = this.id2;

    // Defaults empty values:
    let defaultsArr = patternAdditionalInfo.split('|');
    for (let i = 0; i < defaultsArr.length; i++) {
      parsedObject.field_data[defaultsArr[i]] = [];
    }
    // Start to iterate and format proper object to send in merge request.
    for (let item in this.requestObject) {
      if (this.requestObject.hasOwnProperty(item)) {
        if (this.isObject(this.requestObject[item])) {
          let key = item.match(patternAdditionalInfo);
          if (!key) {
            key = item.match(patternSocialInfo);
            if (!key) {
              key = item.match(patternDateInfo);
            } if (!key) {
              key = item.match(patternContactType);
            }
          }
          if (key) {
            let kName = key[0];
            switch (kName) {
              case 'email':
                if (this.requestObject[item].id) {
                  emailArr.push(this.requestObject[item].id);
                  parsedObject.field_data[`${kName}`] = emailArr;
                  parsedObject.field_data.defaults[`${kName}`] = this.requestObject[item].id;
                }
                break;
              case 'phone':
                if (this.requestObject[item].id) {
                  phoneArr.push(this.requestObject[item].id);
                  parsedObject.field_data[`${kName}`] = phoneArr;
                  parsedObject.field_data.defaults[`${kName}`] = this.requestObject[item].id;
                }
                break;
              case 'address':
                if (this.requestObject[item].id) {
                  addressArr.push(this.requestObject[item].id);
                  parsedObject.field_data[`${kName}`] = addressArr;
                  parsedObject.field_data.defaults[`${kName}`] = this.requestObject[item].id;
                }
                break;
              case 'instagram':
              case 'facebook':
              case 'twitter':
              case 'website':
                if (this.requestObject[item].id) {
                  socialArr.push(this.requestObject[item].id);
                  parsedObject.field_data['social'] = socialArr;
                  parsedObject.field_data.defaults['social'] = this.requestObject[item].id;
                }
                break;
              case 'anniversary':
              case 'birthday':
                if (this.requestObject[item].id) {
                  dateArr.push(this.requestObject[item].id);
                  parsedObject.field_data['date'] = dateArr;
                  parsedObject.field_data.defaults['date'] = this.requestObject[item].id;
                }
                break;
              case 'contact_type':
                if (this.requestObject[item].id) {
                  contactTypeArr = this.requestObject[item].id;
                  parsedObject.field_data['contact_type'] = contactTypeArr;
                  parsedObject.field_data.defaults['contact_type'] = this.requestObject[item].id;
                }
                break;
              default: break;
            }
          }
        }
        if (typeof this.requestObject[item] === 'string' && this.requestObject[item] !== '[empty]') {
          let key = item.match(patternMainContactKeys);
          if (key) {
            let kName = key[0];
            parsedObject.field_data[kName] = this.requestObject[item];
          }
        }
      }
    }
    return parsedObject;
  }
  /**
   * Select all fields for that contact
   * @param {string} side    left/right
   */
  private selectAll(side: string) {
   let aux = {
        key: '',
        value: ''
      };
    let model: any;
    if (side === 'left') {
      model = this.model1;
    } else {
      model = this.model2;
    }
    let key: any;
    for (key in model) {
        if (model.hasOwnProperty(key)) {
          switch (key) {
            case 'dates':
                for (let i = 0; i < model[key].length; i++) {
                  aux.key = this.extractData(this.dateTypes, model[key][i].date_type);
                  aux.value = model[key][i][aux.key];
                  this.checkPropertyAll(side, aux, i);
                }
              break;
            case 'emails':
                for (let i = 0; i < model[key].length; i++) {
                  aux.key = this.extractData(this.emailTypes, model[key][i].email_type) + '_email';
                  aux.value = model[key][i];
                  this.checkPropertyAll(side, aux, i);
                }
              break;
            case 'phones':
              for (let i = 0; i < model[key].length; i++) {
                aux.key = this.extractData(this.phoneTypes, model[key][i].phone_type) + '_phone';
                aux.value = model[key][i];
                this.checkPropertyAll(side, aux, i);
              }
              break;
            case 'addresses':
              for (let i = 0; i < model[key].length; i++) {
                aux.key = 'address';
                aux.value = model[key][i];
                this.checkPropertyAll(side, aux, i);
              }
              break;
            case 'social_networks':
              for (let i = 0; i < model[key].length; i++) {
                aux.key = model[key][i].network;
                aux.value = model[key][i];
                this.checkPropertyAll(side, aux, i);
              }
              break;
            case 'first_name':
              if (model[key].length > 0) {
                aux.key = key;
                aux.value = model[key][0].first_name;
                this.checkPropertyAll(side, aux, 0);
              }
              break;
            case 'last_name':
              if (model[key].length > 0) {
                aux.key = key;
                aux.value = model[key][0].last_name;
                this.checkPropertyAll(side, aux, 0);
              }
              break;
            case 'maiden_name':
              if (model[key].length > 0) {
                aux.key = key;
                aux.value = model[key][0].maiden_name;
                this.checkPropertyAll(side, aux, 0);
              }
              break;
            case 'contact_types':
              if (model[key].length > 0) {
                aux.key = 'contact_type';
                aux.value = model[key][0].contact_type;
                this.checkPropertyAll(side, aux, 0);
              }
              break;
            default:
              break;
          }
        }
      }
   }
  /**
   * Toggle showAllFields value
   *
   */
  private toggleShowAllFields() {
    this.showAllFields = !this.showAllFields;
  }
  /**
   * Verify that the entity is selected
   * @param {Array} types [types of the entity. Ex: this.phoneTypes]
   * @param {string} entity [entity to check. Ex: 'phones']
   * @param {string} name [individual entity name. Ex: 'phone']
   * @param {string} checkField [field name to check the equality. Ex: 'number']
   */
  private isSelectEntity(types: Array<any>, entity: string, name: string, checkField: string) {
    let select = true;
    let type_name1 = null;
    let type_name2 = null;
    let length;
    if (this.aux1[entity].length > this.aux2[entity].length) {
      length = this.aux1[entity].length;
    } else {
      length = this.aux2[entity].length;
    }
    for (let i = 0; i < length ; i++) {
      if (name !== 'network' && name !== 'contact_type') {
        type_name1 = this.extractData(types, this.aux1[entity][i][`${name}_type`]);
        type_name2 = this.extractData(types, this.aux2[entity][i][`${name}_type`]);
        if (name === 'date' && this.aux1[entity][i] !== undefined) {
          let key = type_name1 + '_' + i;
          if (!this.isSelect(key)) {
            select = false;
          }
        } else {
          if (this.aux1[entity][i] !== undefined) {
             let key = type_name1 + '_' + name + '_' + i;
              if (!this.isSelect(key)) {
                select = false;
              }
            }
         }
      } else if (name === 'contact_type' && this.aux1[entity][0] !== undefined) {
         let key = name + '_' + i;
          if (!this.isSelect(key)) {
            select = false;
          }
      } else {
        if (this.aux1[entity][i]  !== undefined) {
          let key = this.aux1[entity][i][name] + '_' + i;
          if (!this.isSelect(key)) {
            select = false;
          }
        }
      }
    }
    return select;
  }
  /**
   * Verifies whether the field is selected and adds it to the unselected list
   * @param {any} key field name
   */
  private isSelect(key) {
    let select = false;
    if (this.lftDisabled[key] === true || this.rgtDisabled[key] === true) {
          select = true;
      } else {
        this.notSelect.push(key);
      }
    return select;
  }
  /**
   * Verifies that all fields are selected
   *
   */
  private validateSelection() {
   let valid = true;
   let validDate = this.isSelectEntity(this.dateTypes, 'dates', 'date', 'date');
   let validPhone = this.isSelectEntity(this.phoneTypes, 'phones', 'phone', 'number');
   let validEmail = this.isSelectEntity(this.emailTypes, 'emails', 'email', 'address');
   let validType = this.isSelectEntity(this.contactTypes, 'contact_types', 'contact_type', 'types');
   let validSocial = this.isSelectEntity(undefined, 'social_networks', 'network', 'network_id');
   if (!(validDate && validPhone && validEmail && validType && validSocial)) {
      valid = false;
    }
      // check if first_name, last_name and maiden_name are equals
    let nameFields = ['first_name', 'last_name', 'maiden_name'];
      for (let i = 0; i < nameFields.length; i++) {
        if ( this.aux1[nameFields[i]][0] !== undefined) {
            let key = nameFields[i] + '_0';
            if (! this.isSelect(key)) {
              valid = false;
            }
        }
      }
    return valid;
  }
  /**
   * Check if the field is not checked
   * @param {any} model The item object.
   * @param {number} index The ngFor index to match the child item in contact object or sub object.
   */
  private notCheck(model: any, index: number): boolean {
    let aux = model.key + '_' + index;
    for (let i = 0; i < this.notSelect.length; i++) {
      if (this.notSelect[i] === aux) {
        return true;
      }
    }
  }
  /**
   * Hide confirm modal
   *
   */
  private hideModalConfirm() {
    this.saveSettingModal.hide();
    setTimeout(() => {
      // restore the modal-open class on the body, if not the vertical scrollbar is hidden when cancel is pressed
      let body = document.getElementsByTagName('body')[0];
      body.classList.add('modal-open');
    }, 300);
  }
  /**
   * Check if the addresses of both contacts are empty
   * @param {any} key Field Name
   * @param {number} index The ngFor index to match the child item in contact object or sub object.
   */
  private isTwoAddressEmpty(key: any, index: number): boolean {
    let res = false;
    if (this.model1.equal_addresses[index] !== undefined && this.model2.equal_addresses[index] !== undefined &&
      this.model1.equal_addresses[index][key] !== undefined && this.model2.equal_addresses[index] [key] !== undefined) {
      if (this.model1.equal_addresses[index][key].address1 === '[empty]' &&
        this.model2.equal_addresses[index][key].address1 === '[empty]') {
        res = true;
      }
    }
    return res;
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
