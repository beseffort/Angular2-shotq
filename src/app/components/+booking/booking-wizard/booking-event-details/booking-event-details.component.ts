import { } from '@types/googlemaps'; // tslint:disable-line
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Proposal } from '../../../../models/proposal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Contact } from '../../../../models/contact';
import { Worker } from '../../../../models/worker';
import { BaseAddress } from '../../../../models/address';

import { ContactService } from '../../../../services/contact/contact.service';
import { Observable } from 'rxjs';
import { ProposalService } from '../../../../services/proposal/proposal.service';

@Component({
  selector: 'booking-event-details',
  templateUrl: './booking-event-details.component.html',
  styleUrls: ['./booking-event-details.component.scss']
})
export class BookingEventDetailsComponent {
  @Input() proposal: Proposal;
  @Output() valid = new EventEmitter<boolean>();

  contact: Contact;
  contactForm: FormGroup;
  eventForm: FormGroup;
  phoneTypes;
  workers: Worker[];

  constructor(private formBuilder: FormBuilder,
              private contactService: ContactService,
              private proposalService: ProposalService) {
    this.buildForms();
  }

  ngOnInit() {
    this.getWorkers();
  }

  ngOnChanges(changes) {
    if (this.proposal.job.external_owner) {
      this.contactService.getContact(this.proposal.job.external_owner.id)
        .subscribe(contact => {
          this.contact = contact;
          this.contact.social_networks = [];
          this.contact.address = this.contact.default_address_details || {};

          this.contact.default_phone_details = this.contact.phones &&
            this.contact.phones.find(item => item.id === this.contact.default_phone) ||
            this.contact.phones[0] || {};

          this.contact.default_email_details = this.contact.default_email_details || {};
          this.contactForm.patchValue(this.contact);
          this.contactService.contactAvailablePhoneTypes(this.contact.id).subscribe(phoneTypes => {
            this.phoneTypes = phoneTypes;
          });
        });
    }
  }

  buildForms() {
    this.contactForm = this.formBuilder.group({
      first_name: ['', Validators.compose([
        Validators.required,
      ])],
      last_name: ['', Validators.compose([
        Validators.required,
      ])],
      default_email_details: this.formBuilder.group({
        email_type: '',
        address: ['', Validators.compose([
          Validators.required,
        ])],
      }),
      default_phone_details: this.formBuilder.group({
        phone_type: '',
        number: '',
      }),
      address: this.formBuilder.group({
        address1: ['', Validators.compose([
          Validators.required,
        ])],
        city: '',
        state: '',
        zip: '',
      }),
    });

    this.eventForm = this.formBuilder.group({
      number_of_people: '',
      location: this.formBuilder.group({
        address1: '',
        city: '',
        state: '',
        zip: '',
      }),
    });

    this.contactForm.valueChanges
      .subscribe(value => {
        this.valid.emit(this.contactForm.valid);
      });
  }

  applyChanges() {
    if (this.contactForm.valid) {
      Object.assign(this.contact, this.contactForm.value);

      let defaultEmail = this.contact.emails.find(email => email.id === this.contact.default_email);
      if (defaultEmail) {
        Object.assign(defaultEmail, this.contactForm.value.default_email_details);
      }
      let defaultPhone = this.contact.phones.find(phone => phone.id === this.contact.default_phone);
      if (defaultPhone) {
        Object.assign(defaultPhone, this.contactForm.value.default_phone_details);
      } else {
        this.contact.phones.push(this.contactForm.value.default_phone_details);
      }
      let formAddress = this.contactForm.value.address;
      let address = this.contact.addresses.find(a => a.id === this.contact.default_address);
      if (address) {
        Object.assign(address, this.contactForm.value.address, {default: true});
      } else {
        this.contact.addresses.push(this.contactForm.value.address);
      }

    }
  }

  save() {
    return Observable.create(observer => {
      if (this.contactForm.valid) {
        this.applyChanges();
        this.contactService.update(this.contact)
          .subscribe(c => {
            observer.next(true);
            observer.complete();
          }, error => {
            observer.next(false);
            observer.complete();
          });

      } else {
        observer.next(false);
        observer.complete();
      }
    });
  }

  getWorkers() {
    this.proposalService.getWorkers(this.proposal.id)
      .subscribe((workers: Worker[]) => {
        this.workers = workers;
      });
  }

  updateLocation(place: google.maps.places.PlaceResult) {
    let address = BaseAddress.extractFromGooglePlaceResult(place);
    this.contactForm.patchValue({
      address: address
    });
    this.contactForm.markAsDirty();
  }
}
