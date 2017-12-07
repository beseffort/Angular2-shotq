import {
  Component,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  QueryList,
  ViewChildren,
  ViewChild
}                                       from '@angular/core';
import { Router }                       from '@angular/router';
/* Components */
import { FormFieldComponent }           from '../../../shared/form-field/form-field.component';
/* Services */
import { NgForm }                       from '@angular/forms';
import { ContactService }               from '../../../../services/contact/contact.service';
import { JobService }                   from '../../../../services/client-access/job/job.service';
import { FlashMessageService }          from '../../../../services/flash-message';
import { EmailTypeService }             from '../../../../services/email-type/email-type.service';
import { PhoneTypeService }             from '../../../../services/phone-type/phone-type.service';
import { ModalService }                 from '../../../../services/modal/';
/* Models */
import { Contact }                      from '../../../../models/contact';
import { Email }                        from '../../../../models/email';
import { Phone }                        from '../../../../models/phone';

@Component({
  selector: 'pay-invoice',
  templateUrl: 'pay-invoice.component.html',
  styleUrls: ['pay-invoice.component.scss'],
  providers: [PhoneTypeService, EmailTypeService, JobService]
})
export class PayInvoiceComponent {
  @Output() closeModal = new EventEmitter();
  @ViewChildren(FormFieldComponent) formFields: QueryList<FormFieldComponent>;
  @ViewChild('modalForm')         modalForm: any;
  public contactTypesSelected:    Array<any> = [];
  private response:               string = '';
  private model =                 new Contact();
  private jobId:                  number = 1; // Remove harcoded job when selector works.
  private isLoading:              boolean = false;
  private generalFunctions:       any;
  private isOpen:                 boolean = false;
  private router;
  private componentRef;

  constructor(
    private contactService:       ContactService,
    private flash:                FlashMessageService,
    private emailTypeService:     EmailTypeService,
    private phoneTypeService:     PhoneTypeService,
    private modalService:         ModalService,
    private jobService:           JobService,
    _router:                      Router
  ) { this.router = _router; }

  ngOnInit() {
    this.getUserInfo();
  }

  /**
   * Function to update external owner contact.
   */
  setInvoiceInfo() {
    let errors = false;
    let firstField = null;
    let multiselectError = false;
    let fields = this.formFields.toArray();
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].getErrorsFromParent()) {
        if (!firstField) {
          firstField = fields[i] as FormFieldComponent;
        }
        errors = true;
      }
    }
    this.isLoading = true;
    let minData = {
      'id': ((this.model.id) ? this.model.id : undefined),
      'first_name': ((this.model.first_name) ? this.model.first_name.toLowerCase() : undefined),
      'last_name': ((this.model.last_name) ? this.model.last_name.toLowerCase() : undefined),
      'email': ((this.model.default_email) ? this.model.default_email : undefined),
      /*'phone': this.model.default_phone,*/
      'address': this.model.default_address
    };
    this.contactService.update(minData)
      .subscribe(data => {
          this.response = data;
          this.isLoading = true;
          this.flash.success('The contact has been updated.');
          let accountComponent = this.modalService.getParentRef();
          // update parent user info from account component.
          if (accountComponent !== undefined) {
            accountComponent.getUserInfo();
          }
          this.model = new Contact();
          setTimeout(() => {
            this.closeModal.emit({action: 'close-modal'});
          });
        },
        err => {
          console.error(err);
          this.flash.error('An error has occurred updating the contact, please try again later.');
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
        }
      );
  }
  /**
   * [setComponentRef description]
   * @param {[type]} ref [description]
   */
  public setComponentRef(ref) {
    this.componentRef = ref;
  }
  /**
   * close modal
   */
  public close(e: any) {
    e.preventDefault();
    this.closeModal.emit({action: 'close-modal'});
  }
  /**
   * Function to get primary contact (External Owner)
   */
  public getUserInfo() {
    this.isLoading = true;
    this.jobService.getUserInfoByJob(this.jobId)
      .subscribe(
        response => {
          console.info(response);
          response = undefined; // clear var.
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
  /**
   * Function to check for enter key and trigger submit function.
   *
   * @param {any} e [description]
   */
  public checkForEnter(e: any) {
    if (e.keyCode === 13) {
      this.setInvoiceInfo();
    }
  }
}
