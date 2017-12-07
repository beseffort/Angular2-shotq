import moment from 'moment';
import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { URLSearchParams } from '@angular/http';
declare let require: (any);

@Injectable()
export class GeneralFunctionsService {
  private router: Router; // Router object, with this we can call navigate function.
  private activatedRoute: ActivatedRoute; // Routes url params extractor.
  private paramsSub: any;
  private _ = require('../../../../node_modules/lodash');
  private countries: Array<any> = require('country-data/data/countries.json');
  private uSStates: Array<any> = require('../../../assets/states/us-states/us-states.json');
  private canadaStates: Array<any> = require('../../../assets/states/canada-states/canada-states.json');

  private generalColors = [
    'green',
    'orange',
    'yellow',
    'red',
    'black',
  ];

  static parseUrl(value) {
    let match = value.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
    return match && {
        protocol: match[1],
        host: match[2],
        hostname: match[3],
        port: match[4],
        pathname: match[5],
        search: match[6],
        hash: match[7]
      };
  }

  constructor(_router?: Router,
              activatedRoute?: ActivatedRoute) {
    this.router = _router;
    this.activatedRoute = activatedRoute;
  }

  public assignColors(list: any[]) {
    list.map(item => {
      item.color = `is-${this.generalColors[item.id % this.generalColors.length]}`;
      return item;
    });
  }

  /**
   * Move this function to general functions.
   * @param {string} param url to navigate to.
   */
  public navigateTo(url: string, params?: Array<number>) {
    let ids = this._.map(params, (v, k) => v).join('/');
    if (ids) {
      this.router.navigateByUrl(`${url}/${ids}`);
    } else {
      this.router.navigate([url]);
    }
  }

  /**
   * [getUrlParams description]
   */
  public getUrlParams() {
    return this.activatedRoute.params;
  }

  /**
   * Function to check if the passed item is an object.
   *
   * @param  {any}     item [description]
   * @return {boolean}      [description]
   */
  public isObject(item: any): boolean {
    return typeof item === 'object' || false;
  }

  /**
   * Function to check if the item/key is in the passed array list.
   *
   * @param  {Array<string>} arrKeys [description]
   * @param  {string}        key     [description]
   * @return {boolean}               [description]
   */
  public inArray(arrKeys: Array<any>, key: any): boolean {
    if (arrKeys !== undefined) {
      return arrKeys.indexOf(key) !== -1;
    }
  }

  /**
   * return the parameter type
   * if is an array return 'array'
   * @param {[type]} value [description]
   */
  public typeOf(value) {
    let s = typeof value;
    if (s === 'object') {
      if (value) {
        if (value instanceof Array) {
          s = 'array';
        }
      } else {
        s = 'null';
      }
    }
    return s;
  }

  /**
   * Function to remove portion of text from string.
   */
  public removeText(text, portionToRemove) {
    return text.replace(portionToRemove, '');
  }

  /**
   * Function to get the fullname of the contact.
   *
   * @param {Contact} contact [description]
   */
  public getContactFullName(contact) {
    return `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
  }

  /**
   * Function to get the pagination params.
   */
  public getPaginatorParam(paginator: any, categoryId?: any) {
    if (categoryId !== undefined) {
      let currentPage: string = paginator[categoryId].currentPage;
      let perPage: string = paginator[categoryId].perPage;
      if ((currentPage !== undefined && perPage !== undefined) && (perPage !== '0')) {
        return 'page=' + currentPage + '&page_size=' + perPage;
      }
    } else if (paginator.currentPage !== undefined && paginator.perPage !== undefined && paginator.perPage !== 0) {
      return 'page=' + paginator.currentPage.toString() + '&page_size=' + paginator.perPage.toString();
    }
  }

  /**
   * Function to get the pagination params as Object.
   */
  public getPaginatorObjectParam(paginator: any, categoryId?: any) {
    if (categoryId !== undefined) {
      let currentPage: string = paginator[categoryId].currentPage;
      let perPage: string = paginator[categoryId].perPage;
      if ((currentPage !== undefined && perPage !== undefined) && (perPage.toLowerCase() !== '0')) {
        return {
          page: currentPage,
          page_size: perPage
        };
      }
    } else if (paginator.currentPage !== undefined && paginator.perPage !== undefined && paginator.perPage !== 0) {
      return {
        page: paginator.currentPage.toString(),
        page_size: paginator.perPage.toString()
      };
    }
  }

  /**
   * Function that return the string parameter to the sort order.
   *
   * @return {string} [description]
   */
  public getSortOrderParam(sort: any, cname?: string): string {
    let order: string = 'ordering=';
    let name: string = '';

    // Sort By Name
    name = ((cname === undefined || cname === '') ? 'first_name,last_name' : cname);

    if (!sort.nameAsc && (cname === undefined || cname === '')) {
      name = '-first_name,-last_name';
    } else if (!sort.nameAsc && cname !== undefined) {

      let splittedItems = cname.split(',');
      let itemsLength = splittedItems.length;

      for (let i = 0; i < itemsLength; i++) {

        if (i === 0 && splittedItems[i] !== undefined) {
          name = `-${splittedItems[i]}`;
        } else if (splittedItems[i] !== undefined) {
          name += `,-${splittedItems[i]}`;
        }
      }
    }

    // Sort by email
    let email = 'default_email__address';
    if (!sort.emailAsc) {
      email = '-default_email__address';
    }

    // Sort by creation date
    let date = 'created';
    if (!sort.dateCreatedAsc) {
      date = '-created';
    }

    if (sort.sortedBy === 'name') {
      order += name + ',' + date;
    } else if (sort.sortedBy === 'email') {
      order += email + ',' + date;
    } else {
      order += date + ',' + name;
    }
    return order;
  }

  /**
   * Function that return URLSearchParams from params objects to pass into http.method.
   *
   * @return {string} [description]
   */
  public getSearchParams(params: Object = {}) {
    let res: URLSearchParams = new URLSearchParams();
    for (let key in params) {
      if (params.hasOwnProperty(key))
        res.set(key, params[key]);
    }
    return res;
  }

  /**
   * Function to remove html tags from given text.given
   *
   * @param {[type]} text [description]
   */
  public removeHtmlTags(text) {
    return text ? String(text).replace(/<[^>]+>/gm, '').replace('&nbsp;', '') : '';
  }

  /**
   * Set date format to: Nov 9, 2016
   * @param {date} date [Date to format]
   */
  formatDate(date: Date) {
    let monthNames = [
      'Jan', 'Feb', 'Mar',
      'Apr', 'May', 'Jun', 'Jul',
      'Aug', 'Sep', 'Oct',
      'Nov', 'Dec'
    ];

    if (date) {
      let year = date.getFullYear();
      let month = monthNames[date.getMonth()];
      let day = date.getDate();
      let format = month + ' ' + day + ', ' + year;
      return format;
    }
  }
  /**
   * Format the phone to be displayed
   * @param {string} phone [description]
   */
  public formatPhone(phone: string) {
    let ret = phone;
    // Format phone if string has only numbers
    if (/^\d+$/.test(phone)) {
      if (phone.length === 10) {
        ret = '(' + phone.substr(0, 3) + ') ' + phone.substr(3, 3) + '-' + phone.substr(6, 4);
      } else if (phone.length === 11) {
        ret = '+' + phone[0] + ' ' + phone.substr(1, 3) + ' ' + phone.substr(4, 3) + ' ' + phone.substr(7, 4);
      }
    }
    return ret;
  }
  /**
   * Function to get the state name of a given isocode2
   *
   * @param  {string} isocode [description]
   * @return {string}         [description]
   */
  public getStateNameByIsocode2(isocode: string): string {
    let canadaRes: any = this.getNameFromIsocode2(isocode, this.canadaStates);
    let usaRes: any = this.getNameFromIsocode2(isocode, this.uSStates);
    if (false === canadaRes) {
      return usaRes;
    } else {
      return canadaRes;
    }
  }

  /**
   * Function to get the country name of a given isocode2
   *
   * @param  {string} isocode [description]
   * @return {string}         [description]
   */
  public getCountryNameByIsocode2(isocode: string): string {
    return this.getNameFromIsocode2(isocode, this.countries);
  }

  /**
   * Function to get current url from route.
   */
  public getCurrentUrl() {
    return this.router.url;
  }

  /**
   * Function to check if value is a valid email
   *
   * @param  {string} value [email to validate]
   * @return {boolean}      [is valid]
   */
  public validateEmail(value: string) {
    if (value.match('[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)' +
        '+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)')) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Function to check if value is a valid phone (format: xxx-xxx-xxxx)
   *
   * @param  {string} value [phone to validate]
   * @return {boolean}      [is valid]
   */
  public validatePhone(value: string) {
    let exp = new RegExp(/^([0-9-()+. ]*)$/g);
    if (exp.test(value)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Function to check if value is a string with letters only
   *
   * @param  {string} value [string to validate]
   * @return {boolean}      [is valid]
   */
  public validateLettersOnly(value: string) {
    let exp = new RegExp(/^[A-zÀ-úA-zÀ-ÿ\s\']*$/g);
    if (exp.test(value)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * [validateName description]
   * @param {string} value [description]
   */
  public validateName(value: string) {
    let exp = new RegExp(/^.*[~#%&*{}\\:<>?/+|"]+.*$/g);
    if (!exp.test(value)) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * Transform a string to slug format
   * convert to lowecase and replace spaces for '_'
   * @param {string} a [description]
   */
  public getSlug(a: string) {
    let slug = a.toLowerCase();
    slug = slug.replace(/ /g, '_');
    return slug;
  }

  /**
   * Check if response from API is an error string
   * Return an array with errors
   * @param {any} data [description]
   */
  public validateResponseData(data: any) {
    let errorsMessages = [];
    if (typeof data === 'string') {
      // replace single quotes for doble quotes to prevent JSON.parse() error
      data = data.replace(/u\'/g, '\"');
      data = data.replace(/\'/g, '\"');
      let errors = JSON.parse(data);
      for (let types in errors) {
        if (errors.hasOwnProperty(types)) {
          for (let err of errors[types]) {
            for (let type in err) {
              if (err.hasOwnProperty(type)) {
                for (let msg of err[type]) {
                  errorsMessages.push(msg);
                }
              }
            }
          }
        }
      }
    }
    return errorsMessages;
  }

  /**
   * return moment.js library reference
   */
  public getMomentJS() {
    return moment;
  }

  /**
   * return the array of valid date formats
   */
  public getDateValidFormats() {
    return [
      moment.ISO_8601,
      'MMMM DD, YYYY',
      'MMMM D, YYYY',
      'MMM DD, YYYY',
      'MMM D, YYYY',
      'MM-DD-YYYY',
      'M-DD-YYYY',
      'M-D-YYYY',
      'MM-DD-YY',
      'M-DD-YY',
      'M-D-YY',
      'MM/DD/YYYY',
      'M/DD/YYYY',
      'M/D/YYYY',
      'MM/DD/YY',
      'M/DD/YY',
      'M/D/YY',
      'YYYY/MM/DD',
      'YYYY/M/D',
      'YY/MM/DD',
      'YY/MM/D',
      'YYYY-MM-DD',
      'YYYY-M-D',
      'YY-MM-DD',
      'YY-MM-D',
    ];
  }

  /**
   * Function to get a valid phone format based on below formats.
   */
  public getValidPhoneFormats() {
    return [
      '(555) 555-5555',
      '+1 (333) 555-8899',
      '1 (555) 123-9876',
      '1 124.445.1122',
      '123-555-8895',
      '321.444.9588'
    ];
  }

  /**
   * Function to convert string first letter to uppercase.
   *
   * @param {string} str / String to be formatted.
   */
  public toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  /**
   * Function to get the window height dynamically.
   */
  public setTableHeight(document, checkTable?) {
    let paginatorHeight, tableHeadersHeight, tableDistanceToTop;
    let el: any = document.querySelector('.paginate-container');
    if (el) {
      paginatorHeight = el.offsetHeight;
    } else {
      paginatorHeight = 0;
    }
    el = document.querySelector('#table-container table thead');
    if (el) {
      tableHeadersHeight = el.offsetHeight;
    } else {
      tableHeadersHeight = 0;
    }
    el = document.getElementById('table-container');
    if (el) {
      tableDistanceToTop = el.getBoundingClientRect().top;
    } else {
      tableDistanceToTop = 0;
    }

    let tableHeight = window.innerHeight - (paginatorHeight + tableDistanceToTop + tableHeadersHeight);
    let tableBody: any = document.querySelector('#table-container table tbody');

    if (tableBody) {
      tableBody.style.height = '' + (tableHeight - 30) + 'px';
      if (checkTable !== undefined) {
        checkTable = false;
      }
    }
  }
  /**
   * Function to set the width of the th element of the table.
   */
  public setTableWidth(document) {
    let i;
    let el;
    let table;
    let child;
    table = document.querySelector('table.scroll tbody tr:first-child');
    if (typeof(table) !== 'undefined' && table !== null) {
      let childs = document.querySelector('table.scroll tbody tr:first-child').children;
      for (i = 0; i < childs.length; i++) {
        child = childs[i];
        el = document.querySelector('table.scroll thead tr:first-child th:nth-child(' + (i + 1) + ')');
        el.style.cssText = 'min-width:' + child.offsetWidth + 'px';
      }
    }
  }
  /**
   * This method is for remove spaces that make pipe Date broken on Safari macOS/Edge/IE11
   * @param {string} date [description]
   */
  public sanitizeDate(date: string) {
    if (date) {
      let dt = <moment.Moment>moment(date);
      if (!dt.isValid()) {
        return null;
      }
      let aux = dt.format();
      let p = aux.indexOf('+');
      if (p >= 0) {
        aux = aux.substr(0, p);
      }
      return aux;
    } else {
      return date;
    }
  }

  public formatFileSize(bytes) {
     if (bytes === 0) return '0 Byte';

     let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'],
       i = Math.floor(Math.log(bytes) / Math.log(1024));
     return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
  }

  public isString(value: any) {
    return typeof value === 'string';
  }

  public isUndefined(value: any) {
    return typeof value === 'undefined';
  }

  public extractDeepPropertyByMapKey(obj: any, map: string): any {
    const keys = map.split('.');
    const key = keys.shift();

    return keys.reduce((prop: any, k: string) => {
      return !this.isUndefined(prop) && !this.isUndefined(prop[k])
        ? prop[k]
        : undefined;
    }, obj[key || '']);
  }

  /**
   * Generic function to return isocode2 from country or state.
   *
   * @param  {string}     isocode     [description]
   * @param  {Array<any>} arrToSearch [description]
   * @return {string}                 [description]
   */
  private getNameFromIsocode2(isocode: string, arrToSearch: Array<any>): any {
    for (let entity of arrToSearch) {
      if (isocode === entity.alpha2) {
        return entity.name;
      }
    }
    return false;
  }
}
