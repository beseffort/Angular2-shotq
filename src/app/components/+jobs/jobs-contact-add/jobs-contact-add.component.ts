/**
 * Component JobsNewContactAddComponent
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
/* Services */
import { NgForm } from '@angular/forms';
import { ContactService } from '../../../services/contact/contact.service';
import { PersonService } from '../../../services/person/person.service';
import { FlashMessageService } from '../../../services/flash-message';
import { PhoneTypeService } from '../../../services/phone-type/phone-type.service';
import { EmailTypeService } from '../../../services/email-type/email-type.service';
import { JobPersonService } from '../../../services/job-person/job-person.service';
/* Models */
import { Person } from '../../../models/person';
import { Email } from '../../../models/email';
import { Phone } from '../../../models/phone';

@Component({
    selector: 'jobs-contact-add',
    templateUrl: './jobs-contact-add.component.html',
    styleUrls: ['./jobs-contact-add.component.scss'],
    providers: [PhoneTypeService, EmailTypeService, PersonService, JobPersonService]
})
export class JobsContactAddComponent {
  @Input() jobId;
  @Output() closeModal = new EventEmitter();

  private componentRef;
  private router;
  private response: string = '';
  private model = new Person();
  private addToContacts = false;
  private emailTypes = [];
  private phoneTypes = [];
  private personPhone = new Phone();
  private personEmail = new Email();

  constructor(
    private contactService: ContactService,
    private personService: PersonService,
    private phoneTypeService: PhoneTypeService,
    private emailTypeService: EmailTypeService,
    private jobPersonService: JobPersonService,
    private flash: FlashMessageService,
    _router: Router
  ) { this.router = _router; }

  ngOnInit() {
    // get types to show on selectors
    this.phoneTypeService.getList()
          .subscribe(types => {
            this.phoneTypes = types.results;
            this.personPhone.phone_type = this.phoneTypes[0].id;
    });
    this.emailTypeService.getList()
          .subscribe(types => {
            this.emailTypes = types.results;
            this.personEmail.email_type = this.emailTypes[0].id;
    });
  }

  /**
   * Function to create the person or contact.
   */
  createJobContact() {
    let personData = {
      'first_name': this.model.first_name,
      'last_name': this.model.last_name,
      'brands': [1],
      'job_roles': [1],
      'account': 1,
      'phones': [],
      'emails': []
    };

    if (this.personPhone.number) {
      personData.phones.push(this.personPhone);
    }

    if (this.personEmail.address) {
      personData.emails.push(this.personEmail);
    }

    this.personService.create(personData)
    .subscribe(data => {
      this.model.id = data.id;
      this.addPersonToJob(this.model.id);
    },
    err => {
      this.flash.error('An error has occurred creating the person, please try again later.');
    });
  }

  /**
   * Function to associate a person with a job.
   */
  addPersonToJob(id) {
    let jobPersonData = {
      'name': this.model.first_name + ' ' + this.model.last_name,
      'job': this.jobId,
      'role': 1,
      'person': id
    };
    this.jobPersonService.create(jobPersonData)
      .subscribe(data => {
        this.flash.success('The person has been created and added to the job.');
      },
      err => {
        this.flash.error('An error has occurred associating the job with the created person, please try again later.');
      }
    );
    this.closeModal.emit({action: 'modal-close'});
    this.model = new Person();
    this.personEmail = new Email();
    this.personEmail.email_type = this.emailTypes[0].id;
    this.personPhone = new Phone();
    this.personPhone.phone_type = this.phoneTypes[0].id;
    this.addToContacts = false;
  }
  /**
   * Set parent component ref
   * @param {[type]} ref [reference od parent component object]
   */
  public setComponentRef(ref) {
    this.componentRef = ref;
  }

}
