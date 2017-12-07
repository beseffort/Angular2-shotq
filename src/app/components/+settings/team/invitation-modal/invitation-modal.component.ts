import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BSModalContext } from 'single-angular-modal/plugins/bootstrap';
import { Job } from '../../../models/job';
import { BaseAddress } from '../../../models/address';
import { DialogRef, ModalComponent } from 'single-angular-modal';
import { JobTypeService } from '../../../services/job-type/job-type.service';
import * as _ from 'lodash';
import { datesIntervalValidator } from '../../../validators';
import { JobRole } from '../../../models/job-role';
import { JobType } from '../../../models/job-type';
import { ApiService } from 'app/services';
import { AccessService } from 'app/services/access';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import { QuickJobWindowData } from '../../../top-navbar/quick-job/quick-job.component';
import { Invitation } from '../../../../models/invitation';
import { InvitationService } from '../../../../services/invitation/invitation.service';
import * as choices from '../team.constants';

export class InvitationModalWindowData extends BSModalContext {
  public invitation: Invitation;
}

@Component({
  selector: 'app-invitation-modal',
  templateUrl: './invitation-modal.component.html',
  styleUrls: [
    './invitation-modal.component.scss'
  ],
  providers: [InvitationService]
})
export class InvitationModalComponent implements ModalComponent<QuickJobWindowData> {
  private invitationForm: FormGroup;
  private choices = choices;
  private showFormErrors: boolean = false;
  private isLoading: boolean = false;

  constructor(private fb: FormBuilder,
              private accessService: AccessService,
              private invitationService: InvitationService,
              private flash: FlashMessageService,
              private apiService: ApiService,
              public dialog: DialogRef<QuickJobWindowData>
  ) {

  }

  ngOnInit() {
    this.initInvitationForm();
  }

  patchFormValue(form, data, markTouched: boolean = false) {
    form.patchValue(data);
    if (markTouched) {
      for (let control in data) {
        if (data.hasOwnProperty(control))
          form.controls[control].markAsTouched();
      }
      form.markAsDirty();
    }
  }

  initInvitationForm() {
    let defaultCJRValidators = [Validators.maxLength(15)];
    this.invitationForm = this.fb.group({
      'first_name': [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(30),
        ]),
      ],
      'last_name': [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(30),
        ]),
      ],
      'role': ['', Validators.required],
      'email': [
        '',
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.maxLength(254),
        ]),
        Validators.composeAsync([
          this.asyncValidateUnique.bind(this, 'email')
        ])
      ],
      'job_role': [''],
      'custom_job_role': ['', Validators.compose(defaultCJRValidators)],
    });
    this.invitationForm.controls['job_role'].valueChanges.subscribe((jobRole) => {
      let validators =  jobRole === choices.CUSTOMIZE ? _.concat(defaultCJRValidators, Validators.required) : null;
      this.patchFormValue(this.invitationForm, {'custom_job_role': ''});
      this.invitationForm.controls['custom_job_role'].markAsUntouched();
      this.invitationForm.controls['custom_job_role'].markAsPristine();
      this.invitationForm.controls['custom_job_role'].setValidators(validators);
      this.invitationForm.controls['custom_job_role'].updateValueAndValidity();
    });
  }

  public asyncValidateUnique(fieldName, control) {
    let uniqueInvalid = {[`${fieldName}UniqueInvalid`]: true};
    return new Promise(resolve => {
      if (!control.value)
        resolve(null);

      this.accessService[`testUnique${_.capitalize(fieldName)}`](control.value)
        .subscribe(
          response => {
            response = JSON.parse(response);
            if (response.exists) {
              resolve(uniqueInvalid);
            } else {
              resolve(null);
            }
          },
          error => {
            resolve(uniqueInvalid);
          }
        );
    });
  }

  public create() {
    this.showFormErrors = true;
    if (this.invitationForm.invalid)
      return;
    let data = this.formatInvitationDataToSave();
    return this.invitationService.create(data).subscribe(
      (invitation) => {
        this.flash.success('Invitation was successfully sent.');
        this.dialog.close(invitation);
      }, (error) => {
        this.flash.error(error);
      });
  }


  formatInvitationDataToSave() {
    let data = _.clone(this.invitationForm.value);
    data['account'] = this.apiService.getAccount();
    return data;
  }

  close() {
    this.dialog.dismiss();
  }

}
