import moment from 'moment';
import { Component, ViewChild } from '@angular/core';
import {  } from '@types/googlemaps';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BSModalContext } from 'single-angular-modal/plugins/bootstrap';
import { Job } from '../../../models/job';
import { EventGroup } from '../../../models/event-group';
import { BaseAddress } from '../../../models/address';
import { DialogRef, ModalComponent } from 'single-angular-modal';
import { JobTypeService } from '../../../services/job-type/job-type.service';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';
import { ApiService } from '../../../services/api/api.service';
import { JobService } from '../../../services/job/job.service';
import * as _ from 'lodash';
import { datesIntervalValidator } from '../../../validators';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { ContactSetOrCreateComponent } from '../../+contacts/contact-set-or-create/contact-set-or-create.component';
import { JobRole } from '../../../models/job-role';
import { JobType } from '../../../models/job-type';
import { JobRoleService } from 'app/services';
import { JobContact } from '../../../models/job-contact';


export class QuickJobWindowData extends BSModalContext {
  public job: Job;
}

@Component({
  selector: 'app-quick-job',
  templateUrl: './quick-job.component.html',
  styleUrls: [
    './quick-job.component.scss'
  ],
  providers: [ContactSetOrCreateComponent, JobService, JobTypeService, JobRoleService]
})
export class QuickJobComponent implements ModalComponent<QuickJobWindowData> {
  private jobForm: FormGroup;
  private method: string;
  private job: Job;
  private roles: any[] = [];
  private jobTypes: any[] = [];
  private jobContact: JobContact;
  private showFormErrors: boolean = false;
  private isLoading: boolean = false;
  @ViewChild(ContactSetOrCreateComponent) private childContactSetOrCreateComponent: ContactSetOrCreateComponent;

  static patchFormValue(form, data, markTouched: boolean = false) {
    form.patchValue(data);
    if (markTouched) {
      for (let control in data) {
        if (data.hasOwnProperty(control))
          form.controls[control].markAsTouched();
      }
      form.markAsDirty();
    }
  }


  constructor(private fb: FormBuilder,
              private jobService: JobService,
              private jobTypeService: JobTypeService,
              private flash: FlashMessageService,
              private apiService: ApiService,
              private jobRoleService: JobRoleService,
              private router: Router,
              public dialog: DialogRef<QuickJobWindowData>
  ) {
    this.job = this.dialog.context.job;
    this.jobContact = _.first(_.get(this.job, 'job_contacts', [])) || {};
    this.method = this.job.id ? 'update' : 'create';
  }

  ngOnInit() {
    this.isLoading = true;
    this.initJobForm();

    if (!this.job.id) {
      this.jobForm['controls'].main_event_group['controls'].start
        .valueChanges
        .subscribe((start) => {
          this.onStartDateChange(start);
        });

      this.jobForm['controls'].main_event_group['controls'].end
        .valueChanges
        .subscribe((end) => {
          this.onEndDateChange(end);
        });
    }
  }

  onStartDateChange(value) {
    this.jobForm['controls'].main_event_group['controls'].start.clearValidators();
    if (value) {
      this.jobForm['controls'].main_event_group['controls'].end.setValidators(Validators.required);
    } else {
      this.jobForm['controls'].main_event_group['controls'].end.clearValidators();
      this.jobForm['controls'].main_event_group['controls'].end.reset(null, {emitEvent: false});
    }
    this.updateDatepickerValidity();
  }

  onEndDateChange(value) {
    this.jobForm['controls'].main_event_group['controls'].end.clearValidators();
    if (value) {
      this.jobForm['controls'].main_event_group['controls'].start.setValidators(Validators.required);
    } else {
      this.jobForm['controls'].main_event_group['controls'].start.clearValidators();
    }
    this.updateDatepickerValidity();
  }

  updateDatepickerValidity() {
    this.jobForm['controls'].main_event_group['controls'].start.updateValueAndValidity({emitEvent: false});
    this.jobForm['controls'].main_event_group['controls'].end.updateValueAndValidity({emitEvent: false});
    this.jobForm.updateValueAndValidity();
  }

  ngAfterViewInit() {
    this.initData();
  }

  initJobForm() {
    this.jobForm = this.fb.group({
      name: [
        this.job.name,
        Validators.compose([
          Validators.required,
          Validators.maxLength(200)
        ])
      ],
      job_type: [''],
      job_contact_role: [_.get(this.jobContact, 'roles[0]', ''), Validators.required]
    });
    if (!this.job.id) {
      let mainEventGroup = this.initMainEventForm();
      EventGroup.setInitialStartTime(mainEventGroup);
      this.jobForm.addControl('main_event_group', mainEventGroup);
      console.log("main_event_group_init", this.jobForm['controls'].main_event_group['controls'].value);
    }
  }

  initMainEventForm(): FormGroup {
    return this.fb.group({
      address: [
        _.get(this.job, 'main_event_group.address', ''),
        Validators.compose([
          Validators.maxLength(200)
        ])
      ],
      location_name: [
        _.get(this.job, 'main_event_group.location_name', ''),
        Validators.compose([
          Validators.maxLength(120)
        ])
      ],
      location: this.job.main_event_group,
      start: [_.get(this.job, 'main_event_group.start', null)],
      end: [_.get(this.job, 'main_event_group.end', null)],
      all_day: [_.get(this.job, 'main_event_details.all_day', false)],
    }, {validator: datesIntervalValidator('start', 'end')});
  }

  patchForm(formName: string, values: any) {
    QuickJobComponent.patchFormValue(this[formName], values);
  }

  getJobTypes() {
    return this.jobTypeService.getList()
      .map(res => res.results.map(item => ({value: item.id, label: item.name})));
  }

  initData() {
    Observable.forkJoin([
      this.getJobTypes(),
      this.jobRoleService.getList().map(res => res.results.map(jobRole => (JobRoleService.newObject(jobRole)))),
      this.childContactSetOrCreateComponent.initData(),
    ]).finally(() => { this.isLoading = false; })
      .subscribe(([jobTypes, jobRoles, nill]: [JobType[], JobRole[], null]) => {
        this.jobTypes = jobTypes;
        setTimeout(() => {
          this.patchForm('jobForm', _.pick(this.job, ['job_type']));
        });
        this.roles = jobRoles;
      });
  }

  formatMainEventGroup() {
    return _.pick(
      this.jobForm.value['main_event_group'],
      'location_name', 'address', 'start', 'end', 'location');
  }

  formatJobDataToSave() {
    return Observable.create(observer => {
      let data = _.clone(this.jobForm.value);
      if (!this.job.id) {
        data['main_event'] = _.clone(this.jobForm.controls['main_event_group'].value);
        data['main_event_group'] = this.formatMainEventGroup();
      }
      data['account'] = this.apiService.getAccount();
      data['job_contact'] = {
        id: this.jobContact.id,
        role: this.jobForm.controls.job_contact_role.value.id
      };
      this.childContactSetOrCreateComponent.getValue().subscribe((contactID) => {
          data['external_owner'] = contactID;
          observer.next(data);
          observer.complete();
        }
      );
    });
  }

  update(data) {
    return this.jobService.update(this.job.id, data);
  }

  create(data) {
    console.log("create", data);
    return this.jobService.create(data);
  }

  createOrUpdate() {
    // console.log("main-event-group", this.jobForm.controls['main_event_group'].value);
    if (this.jobForm.invalid || this.childContactSetOrCreateComponent.isInvalid()) {
      this.showFormErrors = true;
      return;
    }

    this.isLoading = true;
    this.formatJobDataToSave()
      .finally(() => { this.isLoading = false; })
      .subscribe((data) => {
        console.log("newjob", data);
          this[this.method](data).subscribe(
            result => {
              this.flash.success(`The job has been ${this.method}d.`);
              this.dialog.close(result);
            }
          );
        }, (err) => {
          this.flash.error('An error has occurred creating the job, please try again later.');
          console.error(err);
        }
      );
  }

  close() {
    this.dialog.dismiss();
    // On safari modal-open(which hide scrollbar) class not removed from body tag
    document.querySelector('body').classList.remove('modal-open');
  }

  updateLocation(place: google.maps.places.PlaceResult) {
    let address = BaseAddress.extractFromGooglePlaceResult(place);
    this.jobForm.controls['main_event_group'].patchValue({
      address: address.address1,
      location: address
    });
  }

  onEndDateTimePickerShow(mainEventGroupForm: FormGroup) {
    EventGroup.setInitialEndTime(mainEventGroupForm);
  }

}
