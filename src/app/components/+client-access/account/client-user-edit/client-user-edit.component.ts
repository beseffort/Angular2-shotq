import { } from '@types/googlemaps'; // tslint:disable-line
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { BSModalContext } from 'single-angular-modal/plugins/bootstrap';
import * as _ from 'lodash';

import { DialogRef, ModalComponent } from 'single-angular-modal';
import { ContactService } from '../../../../services/contact/contact.service';
import { Contact } from '../../../../models/contact';
import { BaseAddress } from '../../../../models/address';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';


export class ClientUserWindowData extends BSModalContext {
  public contactId: number;
}


@Component({
  selector: 'app-client-user-edit',
  templateUrl: './client-user-edit.component.html',
  styleUrls: [
    './client-user-edit.component.scss'
  ]
})
export class ClientUserEditComponent implements ModalComponent<ClientUserWindowData> {
  isLoading: boolean = false;
  contactId: number;
  contactInfo: Contact;
  form: FormGroup;

  constructor(private fb: FormBuilder,
              private contactService: ContactService,
              private flash: FlashMessageService,
              public dialog: DialogRef<ClientUserWindowData>) {
  }

  ngOnInit() {
    this.isLoading = true;
    this.contactId = this.dialog.context['contactId'];

    this.initForm();
    this.getUserInfo();
  }

  initForm() {
    this.form = this.fb.group({
      id: [''],
      first_name: ['', Validators.compose([
        Validators.required, Validators.maxLength(30)
      ])],
      last_name: ['', Validators.compose([
        Validators.required, Validators.maxLength(30)
      ])],
      default_phone_details: this.fb.group({
        number: ['',  Validators.compose([
          Validators.maxLength(30), Validators.required
        ])]
      }),
      default_email_details: this.fb.group({
        address: ['', Validators.compose([
          Validators.required, Validators.email
        ])],
      }),
      default_address_details: this.fb.group({
        address1: ['', Validators.compose([
          Validators.maxLength(200), Validators.required
        ])],
        city: '',
        state: '',
        zip: '',
        country: ''
      }),
      default_address: {}
    });
  }

  getUserInfo() {
    this.contactService
      .getContact(this.contactId)
      .subscribe(
        response => {
          this.contactInfo = response;
          this.contactInfo.default_email_details = this.contactInfo.default_email_details || {};
          this.contactInfo.default_phone_details = this.contactInfo.default_phone_details || {};
          this.contactInfo.default_address_details = this.contactInfo.default_address_details || {};
          this.form.patchValue(this.contactInfo);
        },
        err => {
          console.error(err);
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  prepareData() {
    let data = this.form.value;

    data['id'] = this.contactInfo.id;
    data['emails'] = this.contactInfo.emails;
    data['addresses'] = this.contactInfo.addresses;
    data['phones'] = this.contactInfo.phones;

    data = this.prepareChildSerializerData(data, 'phones', 'default_phone_details');
    data = this.prepareChildSerializerData(data, 'emails', 'default_email_details');
    data = this.prepareChildSerializerData(data, 'addresses', 'default_address_details');

    return data;
  }

  prepareChildSerializerData(data, key, default_key) {
    let defaultValue;
    if (_.every(_.values(data[default_key]), function(v) { return !v; })) {
      // If child serializer have all empty values
      _.remove(data[key], {id: this.contactInfo[default_key]['id']});
      data[default_key] = null;
      return data;
    }

    // Search for default value in all values and update it
    defaultValue = _.find(data[key], {id: this.contactInfo[default_key]['id']}) || {'default': true};
    defaultValue['default'] = true;
    Object.assign(defaultValue, data[default_key]);
    if (!defaultValue.id) {
      data[key].push(defaultValue);
    }

    return data;
  }

  save() {
    if (this.form.pristine) {
      this.close();
      return;
    }

    let data = this.prepareData();
    this.isLoading = true;
    this.contactService
      .update(data)
      .subscribe(
        response => {
          this.close(response);
          this.flash.success('Data was successfully saved.');
        },
        err => {
          console.error(err);
          this.flash.error('Error occurred during saving data.');
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  valid() {
    return this.form.valid;
  }

  close(result?: any) {
    if (result) {
      this.dialog.close(result);
      return;
    }

    this.dialog.dismiss();
  }

  updateLocation(place: google.maps.places.PlaceResult) {
    let address = BaseAddress.extractFromGooglePlaceResult(place);
    this.form.patchValue({
      default_address_details: address
    });
    this.form.markAsDirty();
  }

}
