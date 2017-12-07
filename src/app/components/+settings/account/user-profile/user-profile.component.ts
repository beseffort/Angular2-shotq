import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { FileUploader } from 'ng2-file-upload';

import * as choices from '../account.constants';
import { AccessService } from '../../../../services/access/access.service';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import { ApiService } from '../../../../services/api/api.service';
import { BreadcrumbService } from '../../../shared/breadcrumb/components/breadcrumb.service';
import { EqualValidator } from '../../../../validators/equal.validator';
import { SignalService } from '../../../../services/signal-service/signal.service';


@Component({
  templateUrl: './user-profile.component.html',
  styleUrls: ['../account.component.scss']
})
export class UserProfileSettingsComponent {
  public choices: any = choices;
  public image: any;

  uploader: FileUploader;

  private isLoading: boolean = false;
  private canSave: boolean = false;
  private user: any;
  private userForm: FormGroup;
  private passwordForm: FormGroup;
  private passwordErrors: any[] = [];

  constructor(private accessService: AccessService,
              private flash: FlashMessageService,
              private fb: FormBuilder,
              private router: Router,
              private breadcrumbService: BreadcrumbService,
              private apiService: ApiService,
              private signal: SignalService) {
    this.uploader = new FileUploader({
      url: this.apiService.apiUrl + '/storage/upload/' + this.apiService.auth.id + '/',
      authToken: this.apiService.getOauthAutorization()
    });

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      let json = JSON.parse(JSON.parse(response));
      this.patchFormValue(this.userForm, {avatar: json.url}, true);
    };

    this.uploader.onCompleteAll = () => {
      this.uploader.clearQueue();
      this.isLoading = false;
      this.flash.success('Profile image was successfully uploaded.');
    };

    breadcrumbService.addFriendlyNameForRoute('/settings/profile', '');
  }

  ngOnInit() {
    this.getInfo();
    this.initPasswordForm();
    this.initUserForm();
  }

  getInfo() {
    this.isLoading = true;
    this.accessService.getUserProfileInfo()
      .subscribe(
        this.extractUserProfile.bind(this),
        error => console.error(error),
        () => this.isLoading = false
      );
  }

  extractUserProfile(result) {
    this.user = result;
    this.patchFormValue(this.userForm, {
      first_name: result.first_name,
      last_name: result.last_name,
      avatar: result.user_profile.avatar,
      email: result.email,
      phone: result.user_profile.phone || '',
      phone_type: result.user_profile.phone_type,
      timezone: result.user_profile.timezone || '',
    });
    this.isLoading = false;
  }

  initUserForm() {
    this.userForm = this.fb.group({
      first_name: ['', Validators.compose([
        Validators.required, Validators.maxLength(30)
      ])],
      last_name: ['', Validators.compose([
        Validators.required, Validators.maxLength(30)
      ])],
      avatar: [''],
      email: ['', Validators.compose([
        Validators.required, Validators.email
      ])],
      phone: [''],
      phone_type: [''],
      timezone: [''],
    });
  }

  initPasswordForm() {
    this.passwordForm = this.fb.group({
      old_password: ['', Validators.compose([
        Validators.required, Validators.maxLength(128)
      ])],
      new_password: ['', Validators.compose([
        Validators.required, Validators.maxLength(128),
        Validators.maxLength(8), EqualValidator('confirm_password', true)
      ])],
      confirm_password: ['', Validators.compose([
        Validators.required, Validators.maxLength(128),
        Validators.maxLength(8), EqualValidator('new_password')
      ])],
    });
  }

  save() {
    this.isLoading = true;

    if (this.userForm.dirty && this.userForm.valid) {
      this.saveProfile();
    }

    if (this.passwordForm.dirty && this.passwordForm.valid) {
      this.changePassword();
    }
  }

  saveProfile() {
    let data = this.formatProfileDataToSave();
    return this.accessService
      .updateUserProfileInfo(data)
      .subscribe(
        (result) => {
          this.passwordErrors = [];
          this.passwordForm.reset();
          this.flash.success('Your profile details were successfully saved.');
          this.userForm.markAsPristine();
          this.isLoading = false;
          this.signal.send({
            group: 'currentUser',
            type: 'edit',
            instance: result
          });
        },
        (errors) => {
          this.passwordErrors = [];
          this.passwordForm.reset();
          this.flash.error('Error while saving user profile details.');
          this.userForm.markAsPristine();
          this.isLoading = false;
        },
        () => this.isLoading = false
      );
  }

  changePassword() {
    this.accessService
      .updatePassword(this.passwordForm.value).subscribe(
        () => {
          this.passwordErrors = [];
          this.passwordForm.reset();
          this.flash.success('Your profile details were successfully saved.');
          this.isLoading = false;
        },
        (errors) => {
          this.passwordErrors = JSON.parse(errors._body)['non_field_errors'];
          this.passwordForm.reset();
          this.isLoading = false;
        },
        () => this.isLoading = false
      );
  }

  formatProfileDataToSave() {
    let data = Object.assign({}, this.userForm.value),
      profileFields = ['phone', 'phone_type', 'timezone', 'avatar'];

    data['user_profile'] = {};
    profileFields.forEach((field) => {
      data.user_profile[field] = data[field];
      delete data[field];
    });
    return Object.assign(this.user, data);
  }

  close() {
    this.router.navigate(['/settings']);
  }

  hasChanges() {
    return this.userForm.dirty && this.userForm.touched ||
      this.passwordForm.dirty && this.passwordForm.touched;
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

  clearFileInput(target, form?, formControlName?) {
    let data = {};
    target.value = '';
    data[formControlName] = '';
    this.patchFormValue(form, data, true);
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
