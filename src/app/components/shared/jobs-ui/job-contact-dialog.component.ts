import { } from '@types/googlemaps'; // tslint:disable-line
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { DialogRef, ModalComponent } from 'single-angular-modal';
import { BSModalContext } from 'single-angular-modal/plugins/bootstrap';
import { IMyInputFieldChanged } from 'ngx-mydatepicker';
import { JobApiJobContact } from '../../../models/job';
import { JobRole } from '../../../models/job-role';
import { BaseAddress } from '../../../models/address';
import { ContactService } from '../../../services/contact/contact.service';
import { JobRoleService } from '../../../services/job-role/job-role.service';
import { ContactsUiService } from '../contacts-ui/contacts-ui.service';

export class JobContactDialogContext extends BSModalContext {
  public content: JobApiJobContact;
}

@Component({
  selector: 'job-contact-dialog',
  templateUrl: './job-contact-dialog.component.html',
  styleUrls: ['./job-contact-dialog.component.scss'],
  providers: [JobRoleService]
})
export class JobContactDialogComponent
    implements OnInit, ModalComponent<JobContactDialogContext> {
  context: JobContactDialogContext;
  private contactFormContext;
  private submitValue: JobApiJobContact;
  private roles: JobRole[] = [];
  private role: JobRole = JobRoleService.newObject();
  private form: FormGroup;

  constructor(public dialog: DialogRef<JobContactDialogContext>,
              private presenter: ContactsUiService,
              private contactService: ContactService) {
    this.context = dialog.context;
    this.context.dialogClass = 'modal-dialog--job-contact';
    this.form = ContactsUiService.createContactBasicDetailsForm();
    this.form.addControl('role', new FormControl(null, Validators.required));
  }

  ngOnInit(): void {
    this.presenter.jobRoles$.subscribe(this.resetRoles.bind(this));
    this.setViewValue(this.context.content);
  }

  updateLocation(place: google.maps.places.PlaceResult) {
    let address = BaseAddress.extractFromGooglePlaceResult(place);
    this.form.patchValue({
      postalAddress: address.address1,
      default_address: address
    });
  }

  private setViewValue(jobContact: JobApiJobContact) {
    if (!jobContact || jobContact === JobApiJobContact.Empty)
      return;
    //noinspection JSIgnoredPromiseFromCall
    this.presenter.createContactFormContext(
        this.contactService.getContact(jobContact.contact))
      .subscribe(context => {
        context.applyToForm(this.form, {role: jobContact.primaryRole});
        this.contactFormContext = context;
        this.resetSubmitValue();
      });
  }

  private resetSubmitValue() {
    this.submitValue = Object.assign(new JobApiJobContact(),
      this.context.content, {
        roles: [this.form.value.role]
      });
  }

  //noinspection JSUnusedLocalSymbols
  private onRoleAdded(role: JobRole) {
    this.roles.push(role);
    this.sortJobRoles();
  }

  private resetRoles(roles: JobRole[]) {
    this.roles = roles;
    this.sortJobRoles();
  }

  private sortJobRoles() {
    this.roles.sort((l, r) => l.name.localeCompare(r.name));
  }

  //noinspection JSUnusedLocalSymbols
  private submit() {
    this.resetSubmitValue();
    // save the `Contact` object first
    this.contactService.update(
        this.contactFormContext.getFormSubmitValue(this.form))
      .subscribe(() => {
        this.dialog.close(this.submitValue);
      });
  }

  //noinspection JSUnusedLocalSymbols
  private cancel() {
    this.dialog.dismiss();
  }

  //noinspection JSMethodCanBeStatic,JSUnusedLocalSymbols
  private onDateFieldChanged(event: IMyInputFieldChanged, control: AbstractControl) {
    if (!event.valid && control)
      control.setErrors({'date': true});
  }
}
