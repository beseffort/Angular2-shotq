import { Component, Input, Output, EventEmitter, ApplicationRef, OnInit, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { FormFieldWrapComponent } from '../form-field-wrap';
import { FormFieldComponent } from '../form-field/form-field.component';
import { Address } from '../../../models/address';

declare let require: (any);

@Component({
  selector: 'form-field-address',
  templateUrl: 'form-field-address.component.html',
  styleUrls: ['form-field-address.component.scss']
})
export class FormFieldAddressComponent implements OnInit {
  @Input() label: string;
  @Input() floating: boolean;
  @Input() placeholder: string;
  @Input() errors: Array<any>;
  @Input() cssClass: string;
  @Input() disabled: boolean;
  @Input() required: boolean;
  @Input() left: boolean = false;
  @Input() type: string;
  @Input() showCloseButton: boolean = true;
  @Input() showPri: boolean = false;
  @Input() showPrimary: boolean = false;
  @Input() fullAddressView: boolean = true;
  @Input() showOnLabel: boolean = false;
  @Input() showDelete: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() options: Array<any>;

  @Input() ngValue: any = {};
  @Output() ngValueChange: EventEmitter<Object> = new EventEmitter<Object>();
  @Output() onDelete: EventEmitter<any> = new EventEmitter<any>();
  @Output() onBlur: EventEmitter<any> = new EventEmitter<any>();

  @ViewChildren(FormFieldComponent) formFields: QueryList<FormFieldComponent>;

  public _ = require('../../../../../node_modules/lodash');
  public origCountries: Array<any> = require('country-data/data/countries.json');
  public countries = [];
  public manualMode: boolean = false;
  public selectedCountry: string = '';
  public fieldsToValidate = ['city', 'state', 'zip'];

  inputGroupId: string = this._.uniqueId('input-group-');
  inputId: string = this._.uniqueId('input-');
  spanId: string = this._.uniqueId('span-');

  constructor(private ref: ApplicationRef, private changeDet: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.ngValue = this.ngValue || {};
    this.manualMode = this.fullAddressView || false;
    this.formatCountries();
  }
  /**
   * Order the countries by name and put USA and Canada on top
   */
  formatCountries() {
    let usa = {};
    let canada = {};
    let orderedCountries = this._.sortBy(this.origCountries, [function(country) { return country.name; }]);

    for (let i = 0; i < orderedCountries.length; i++) {
      let countryData = {
        'id': orderedCountries[i].alpha2,
        'name': orderedCountries[i].name
      };
      if (countryData.id === 'US') {
        usa = countryData;
      } else if (countryData.id === 'CA') {
        canada = countryData;
      } else {
        this.countries.push(countryData);
      }
    }
    if (canada !== {}) {
      this.countries.unshift(canada);
    }
    if (usa !== {}) {
      this.countries.unshift(usa);
    }
    if (this.ngValue.country) {
      this.mapCountryId(this.ngValue.country);
    }
  }
  /**
   * Get selected country name by id
   */
  mapCountryId(id: any) {
    if (id !== undefined) {
      for (let i = 0; i < this.countries.length; i++) {
        if (String(this.countries[i].id) === String(id)) {
          this.selectedCountry = this.countries[i].name;
          break;
        }
      }
    } else if (this.countries && this.countries[0]) {
      this.selectedCountry = this.countries[0].name;
    }
  }
  /**
   * Display address in one line
   */
  displayAddress() {
      let components = [this.ngValue['address1'], this.ngValue['address2'], this.ngValue['city'], this.ngValue['state'], this.ngValue['zip'],
      this.ngValue['country']];
      return this._.compact(components).join(', ');
  }
  /**
   * Display address in two line
   */
  displayAddressSplited(line: number) {
    let address = '';
    if (this.ngValue['address1'] !== '[empty]') {
      if (line === 1) {
        if (this.ngValue['address2'] !== null && this.ngValue['address2'] !== '') {
          address = this.ngValue['address1'] + ', ' + this.ngValue['address2'];
        } else {
           address = this.ngValue['address1'];
        }
      } else {
        address = this.ngValue['city'] + ', ' + this.ngValue['state'] + ' ' + this.ngValue['zip'] + ' ' + this.ngValue['country'];
      }
    } else {
      if (line === 1) {
        address = '[empty]';
      }
    }
    return address;
  }
  /**
   * Return true if the address is Empty
   */
  isEmpty() {
    if (this.ngValue['address1'] === '[empty]') {
      return true;
    } else {
      return false;
    }
  }
  /**
   * When span from Address 1 is clicked, focus the input
   */
  onSpanClick() {
    let input = document.getElementById(this.inputId);
    if (input) {
      input.focus();
    }
  }

  /**
   * Add "selected" class to span when input has focus
   */
  addSelectedClass() {
    let inputGroup = document.getElementById(this.inputGroupId);
    inputGroup.classList.add('input-group-focused');
  }
  /**
   * Remove "selected" class to span when input lost focus
   */
  removeSelectedClass(e?: any) {
    this.onBlur.emit(e);
    let inputGroup = document.getElementById(this.inputGroupId);
    inputGroup.classList.remove('input-group-focused');
  }
  /**
   * Get errors from parent component
   */
  getErrorsFromParent() {
    let firstAddressField = null;
    this.errors = [];
    if (this.required && (this.ngValue.address1 === '' || this.ngValue.address1 === undefined)) {
      this.errors.push(['The above field is required. Please, enter Address 1']);
      firstAddressField = this;
    }

    for (let fieldName of this.fieldsToValidate) {
      let fields = this.formFields.toArray();
      for (let i = 0; i < fields.length; i++) {
        if (fields[i].auxname && fields[i].auxname === fieldName) {
          fields[i].errors = [];
          if ((this.required || (this.ngValue.address1 !== '' && this.ngValue.address1 !== undefined)) &&
            (this.ngValue[fieldName] === '' || this.ngValue[fieldName] === undefined)) {
              fields[i].errors.push('The above field is required. Please, enter ' + fields[i].label);
              if (!firstAddressField) {
                firstAddressField = fields[i];
              }
          }
        }
      }
    }

    return firstAddressField;
  }
  /**
   * Clear existing address and search again
   */
  private clearAndSearchAgain() {
    this.ngValue = { visible: this.ngValue.visible };
    this.ngValueChange.emit(this.ngValue);
    this.manualMode = false;
  }
  /**
   * Address changed event
   */
  private emitValueChange() {
    this.checkFields();
    this.getErrorsFromParent();
    this.ngValueChange.emit(this.ngValue);
  }
  /**
   * Search address
   */
  private getAddress(googlePlace: Object) {
    let address = new Address();
    address.address1 = googlePlace['name'];
    address.visible = this.ngValue.visible;
    const fieldsMappings = {country: 'country', state: 'administrative_area_level_1', city: 'locality', zip: 'postal_code'};
    this._.forEach(googlePlace['address_components'], (component) => {
      this._.forEach(fieldsMappings, (componentType, field) => {
        if (this._.includes(component['types'], componentType)) {
          address[field] = field === 'country' ? component['short_name'] : component['long_name'];
        }
      });
    });
    if (this.ngValue.id) {
      address.id = this.ngValue.id;
    }
    if (this.ngValue.name) {
      address.name = this.ngValue.name;
    }
    if (this.ngValue.account) {
      address.account = this.ngValue.account;
    }
    this.ngValue = address;
    this.getErrorsFromParent();
    this.mapCountryId(this.ngValue.country);
    this.ngValueChange.emit(this.ngValue);
    this.manualMode = true;
    this.changeDet.detectChanges();
  }
  /**
   * Get errors
   */
  private getErrors(inputRef, label: string) {
    return (inputRef.touched && !inputRef.valid) ?
      (this.errors || []).concat(['The above field is required. Please enter ' + label]) :
      this.errors;
  }
  /**
   * Emit event when delete icon is pressed
   */
  private valueDeleted(e: any) {
    this.onDelete.emit(e);
    this.getErrorsFromParent();
  }
  /**
   * Check if any field is filled to show trash icon
   */
  private checkFields() {
    if ((this.ngValue.address1 !== '' && this.ngValue.address1 !== undefined) ||
     (this.ngValue.address2 !== '' && this.ngValue.address2 !== undefined) ||
     (this.ngValue.city     !== '' && this.ngValue.city     !== undefined) ||
     (this.ngValue.state    !== '' && this.ngValue.state    !== undefined) ||
     (this.ngValue.zip      !== '' && this.ngValue.zip      !== undefined)
    ) {
      return true;
    } else {
      return false;
    }
  }
}
