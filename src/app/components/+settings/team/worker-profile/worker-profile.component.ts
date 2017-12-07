import * as _ from 'lodash';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { FileUploader } from 'ng2-file-upload';

import * as choices from '../team.constants';
import { AccessService } from '../../../../services/access/access.service';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import { ApiService } from '../../../../services/api/api.service';
import { BreadcrumbService } from '../../../shared/breadcrumb/components/breadcrumb.service';
import { Worker } from '../../../../models/worker';
import { WorkerService } from '../../../../services/worker/worker.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  templateUrl: './worker-profile.component.html',
  styleUrls: ['./worker-profile.component.scss']
})
export class WorkerProfileSettingsComponent {
  public choices: any = choices;
  public image: any;

  uploader: FileUploader;

  private isLoading: boolean = false;
  private worker: Worker;
  private workerForm: FormGroup;

  constructor(private flash: FlashMessageService,
              private fb: FormBuilder,
              private breadcrumbService: BreadcrumbService,
              private apiService: ApiService,
              private workerService: WorkerService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.initWorker(params['id']);
      this.initUploader(params['id']);
    });
  }

  initUploader(workerId: number) {
    this.uploader = new FileUploader({
      url: this.apiService.apiUrl + '/storage/upload/' + workerId + '/',
      authToken: this.apiService.getOauthAutorization()
    });

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      let json = JSON.parse(JSON.parse(response));
      this.patchFormValue(this.workerForm, {avatar: json.url}, true);
    };

    this.uploader.onCompleteAll = () => {
      this.uploader.clearQueue();
      this.isLoading = false;
      this.flash.success('Profile image was successfully uploaded.');
    };
  }

  initWorker(workerId: number) {
    this.isLoading = true;
    this.workerService.get(workerId)
      .subscribe(
        this.extractWorkerProfile.bind(this),
        error => console.error(error),
        () => this.isLoading = false
      );
  }

  extractWorkerProfile(result) {
    this.worker = result;
    this.breadcrumbService.addFriendlyNameForRouteRegex('^/settings/team/[0-9]+', `Edit ${this.worker.name}`);
    this.initWorkerForm();
    this.patchFormValue(this.workerForm, {
      first_name: this.worker.first_name,
      last_name: this.worker.last_name,
      avatar: this.worker.avatar,
      role: this.worker.role,
      job_role: this.worker.job_role,
      active: this.worker.active,
      custom_job_role: this.worker.custom_job_role,
      hide_billing_details: this.worker.hide_billing_details,
      disable_client_correspondence: this.worker.disable_client_correspondence
    });
  }

  initWorkerForm() {
    let defaultCJRValidators = [Validators.maxLength(15)];
    this.workerForm = this.fb.group({
      first_name: [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(30)
        ])],
      last_name: ['',
        Validators.compose([
          Validators.required,
          Validators.maxLength(30)
        ])],
      custom_job_role: ['', Validators.compose(defaultCJRValidators)],
      avatar: [''],
      role: [''],
      job_role: [''],
      active: [''],
      hide_billing_details: [''],
      disable_client_correspondence: [''],
    });
    this.workerForm.controls['job_role'].valueChanges.subscribe((jobRole) => {
      let validators =  jobRole === choices.CUSTOMIZE ? _.concat(defaultCJRValidators, Validators.required) : null;
      this.patchFormValue(this.workerForm, {'custom_job_role': ''});
      this.workerForm.controls['custom_job_role'].markAsUntouched();
      this.workerForm.controls['custom_job_role'].markAsPristine();
      this.workerForm.controls['custom_job_role'].setValidators(validators);
      this.workerForm.controls['custom_job_role'].updateValueAndValidity();
    });
  }

  save() {
    this.isLoading = true;
    if (this.workerForm.dirty && this.workerForm.valid) {
      let data = this.formatWorkerDataToSave();
      return this.workerService
        .partialUpdate(this.worker.id, data)
        .subscribe(
          () => {
            this.router.navigate(['/settings/team']);
            this.flash.success('Profile details were successfully saved.');
          },
          (errors) => {
            this.flash.error('Error while saving profile details.');
          },
          () => {
            this.workerForm.markAsPristine();
            this.isLoading = false;
          }
        );
    }
  }

  cancel() {
    this.router.navigate(['/settings/team']);
  }

  formatWorkerDataToSave() {
    let data = _.clone(this.workerForm.value);
    if (!data['avatar'])
      delete data['avatar'];
    return data;
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

  onFileChange(event) {
    let hasError;

    if (event.target.files.length === 0) {
      this.uploader.clearQueue();
    }

    hasError = this.validateFiles(event.target.files, event.target.accept);
    if (hasError) {
      this.flash.error('Please make sure you upload valid image file no bigger than 10 MB.');
      return;
    }

    this.isLoading = true;
    for (let fileItem of this.uploader.queue) {
      fileItem.withCredentials = false;
      fileItem.upload();
    }
  }

  validateFiles(files: Object[], types: string[], maxsize: number = 10000000): boolean {
    for (let file of files) {
      if (file['size'] > maxsize || types.indexOf(file['type']) === -1 )
        return true;
    }
    return false;
  }

}
