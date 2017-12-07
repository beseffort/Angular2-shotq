import { } from '@types/googlemaps'; // tslint:disable-line
import { Component, forwardRef, Inject, OnInit } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { IMyInputFieldChanged } from 'ngx-mydatepicker';
import { DialogRef, ModalComponent } from 'single-angular-modal';
import { BSModalContext } from 'single-angular-modal/plugins/bootstrap';

import { BaseAddress } from '../../../models/address';
import { Contact } from '../../../models/contact';
import { ContactsUiService } from './contacts-ui.service';

export class ContactDialogContext extends BSModalContext {
  public content: Contact;
}

@Component({
  selector: 'app-contact-dialog',
  templateUrl: './contact-dialog.component.html',
  styleUrls: ['./contact-dialog.component.scss'],
  providers: [forwardRef(() => ContactsUiService)]
})
export class ContactDialogComponent
    implements OnInit, ModalComponent<ContactDialogContext> {
  context: ContactDialogContext;
  private contactFormContext;

  private isLoading: boolean = false;
  private isNewObject: boolean;
  private submitValue: any;
  private form: FormGroup;

  constructor(
      @Inject(forwardRef(() => ContactsUiService)) private presenter: ContactsUiService,
      public dialog: DialogRef<ContactDialogContext>) {
    this.context = dialog.context;
    this.context.dialogClass = 'modal-dialog--contact';
    this.form = ContactsUiService.createContactBasicDetailsForm();
  }

  ngOnInit(): void {
    this.setViewValue(this.context.content);
  }

  updateLocation(place: google.maps.places.PlaceResult) {
    let address = BaseAddress.extractFromGooglePlaceResult(place);
    this.form.patchValue({
      postalAddress: address.address1,
      default_address: address
    });
  }

  private setViewValue(contact: Contact) {
    if (!contact || contact === Contact.Empty)
      return;
    console.log("setviewvalue", contact);
    this.isNewObject = !contact.id;
    this.presenter.createContactFormContext(Observable.of(contact))
      .subscribe(context => {
        context.applyToForm(this.form);
        this.contactFormContext = context;
        this.resetSubmitValue();
      });
  }

  private resetSubmitValue() {
    this.submitValue = this.contactFormContext.getFormSubmitValue(this.form);
  }

  //noinspection JSUnusedLocalSymbols
  private submit() {
    this.resetSubmitValue();
    console.log("submitvalue", this.submitValue);
    // this.dialog.close(this.submitValue);
  }

  //noinspection JSUnusedLocalSymbols
  private cancel() {
    this.dialog.dismiss();
    // On safari modal-open(which hide scrollbar) class not removed from body tag
    document.querySelector('body').classList.remove('modal-open');
  }

  //noinspection JSMethodCanBeStatic,JSUnusedLocalSymbols
  private onDateFieldChanged(event: IMyInputFieldChanged, control: AbstractControl) {
    if (!event.valid && control)
      control.setErrors({'date': true});
  }
}
