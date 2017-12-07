import { Component, Input, Output, EventEmitter, ViewEncapsulation, ViewChild, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { JobTypeService } from '../../../services/job-type/job-type.service';
import { JobService } from '../../../services/job/job.service';
import * as _ from 'lodash';
import { ContactService } from '../../../services/contact/contact.service';
import { EmailTypeService } from '../../../services/email-type/email-type.service';
import { EmailType } from '../../../models/email-type';
import { Observable } from 'rxjs/Observable';
import { Contact } from '../../../models/contact';


@Component({
  selector: 'contact-set-or-create',
  templateUrl: 'contact-set-or-create.component.html',
  styleUrls : ['./contact-set-or-create.component.scss'],
  providers: [JobService, JobTypeService]
})
export class ContactSetOrCreateComponent {
  @Input() showErrorsWhen: boolean = false;
  @Input() required: boolean = false;
  @Input() contact: Contact;
  private contactForm: FormGroup;
  private newContactForm: FormGroup;
  private emailTypes: EmailType[] = [];
  private contacts: any = [];
  private dropdownSelectCustomActions: any = [];
  private initialized: boolean = false;

  constructor(private fb: FormBuilder,
              private contactService: ContactService,
              private emailTypeService: EmailTypeService
  ) {
    this.dropdownSelectCustomActions = [
      {label: '+ Add a New Contact', action: this.showNewContactForm.bind(this)}
    ];
  }

  initContactForm() {
    this.contactForm = this.fb.group({
      id: [this.contact ? this.contact.id : null, this.required ? Validators.required : null]
    });
  }

  initNewContactForm() {
    let validatorsList = this.required ? [Validators.required, Validators.maxLength(200)] : [Validators.maxLength(200)];
    this.newContactForm = this.fb.group({
      first_name: ['', validatorsList],
      last_name: ['', validatorsList],
      default_email: ['', validatorsList],
    });
    this.newContactForm.disable();
  }

  getContacts() {
    let params = {page_size: 1000};

    if (!this.contact) {
      params['archived'] = false;
    }

    return this.contactService.getContactList(params)
      .map(res => res.page.map(item => ({value: item.id, label: item.full_name, archived: item.archived})));
  }

  getEmailTypes() {
    return this.emailTypeService.getList()
      .map(res => res.results);
  }

  initData() {
    this.initContactForm();
    this.initNewContactForm();
    return Observable.create(observer => {
      Observable.forkJoin([
        this.getContacts(),
        this.getEmailTypes()
      ]).subscribe(([contacts, emailTypes]) => {
        this.contacts = contacts;
        if (this.contact)
          setTimeout(() => {
            // this.contactForm['id'].patchValue(this.contact.id);
          });

        this.emailTypes = emailTypes;
        this.initialized = true;
        observer.next(null);
        observer.complete();
      });
    });
  }

  getValue() {
    return Observable.create(observer => {
      if (this.contactForm.enabled) {
        observer.next(this.contactForm.controls['id'].value);
        observer.complete();
      } else {
        this.createNewContact().subscribe((data) => {
            observer.next(data.id);
            observer.complete();
          }
        );
      }
    });
  }

  isValid() {
    if (!this.initialized)
      return false;
    return (this.contactForm.enabled ? this.contactForm.valid : true) && (this.newContactForm.enabled ? this.newContactForm.valid : true);
  }

  isInvalid() {
    return !this.isValid();
  }

  formatNewContactDataToSave() {
    let data = _.clone(this.newContactForm.value);
    return {
      first_name: data.first_name,
      last_name: data.last_name,
      emails: [{
        'default': true,
        address: data.default_email,
        email_type: (_.head(this.emailTypes) || new EmailType()).id,
      }],
    };
  }

  showNewContactForm() {
    if (!this.initialized)
      return;
    this.contactForm.disable();
    this.newContactForm.enable();
  }

  hideNewContactForm() {
    if (!this.initialized)
      return;
    this.newContactForm.patchValue({'first_name': '', 'last_name': '', 'default_email': ''});
    this.newContactForm.disable();
    this.contactForm.enable();
  }

  createNewContact() {
    let data = this.formatNewContactDataToSave();
    return this.contactService.create(data);
  }
}
