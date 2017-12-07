import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { FileUploader } from 'ng2-file-upload';
import { CustomValidators } from 'ng2-validation';

import * as choices from '../account.constants';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import { AccessService } from '../../../../services/access/access.service';
import { ApiService } from '../../../../services/api/api.service';
import { BreadcrumbService } from '../../../shared/breadcrumb/components/breadcrumb.service';


@Component({
  templateUrl: './company.component.html',
  styleUrls: ['../account.component.scss']
})
export class CompanySettingsComponent {
  public choices: any = choices;

  uploader: FileUploader;

  private isLoading: boolean = false;
  private account: any;
  private form: FormGroup;

  constructor(private accessService: AccessService,
              private flash: FlashMessageService,
              private fb: FormBuilder,
              private router: Router,
              private breadcrumbService: BreadcrumbService,
              private apiService: ApiService) {
    this.uploader = new FileUploader({
      url: this.apiService.apiUrl + '/storage/upload/' + this.apiService.auth.id + '/',
      authToken: this.apiService.getOauthAutorization()
    });

    this.uploader.onCompleteAll = () => {
      this.uploader.clearQueue();
      this.isLoading = false;
      this.flash.success('Image was successfully uploaded.');
    };

    breadcrumbService.addFriendlyNameForRoute('/settings/company', '');
  }

  ngOnInit() {
    this.isLoading = true;
    this.getInfo();
    this.initForm();
  }

  getInfo() {
    this.accessService.getLoggedAccountId()
      .subscribe(
        this.extractAccount.bind(this),
        error => {
          console.error(error);
          this.isLoading = false;
        },
        () => this.isLoading = false
      );
  }

  extractAccount(result) {
    this.account = result[0];
    this.patchFormValue(this.form, result[0]);
    this.isLoading = false;
  }

  initForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(200)
      ])],
      logo: [''],
      background: [''],
      phone: ['', Validators.compose([
        Validators.maxLength(30),
        CustomValidators.phone
      ])],
      alt_phone: ['', Validators.compose([
        Validators.maxLength(30),
        CustomValidators.phone
      ])],
      email: ['', Validators.compose([
        Validators.email,
        Validators.maxLength(254),
      ])],
      website: [''],
      address1: ['', Validators.maxLength(255)],
      address2: ['', Validators.maxLength(255)],
      city: ['', Validators.maxLength(255)],
      state: ['', Validators.maxLength(255)],
      zip: ['', Validators.maxLength(12)],
      about: ['']
    });
  }

  save() {
    let data = Object.assign(this.account, this.form.value);
    if (data.website && data.website.search('http') < 0) {
      data.website = `http://${data.website}`;
    }
    this.isLoading = true;
    this.accessService
      .updateLoggedAccountInfo(this.account.id, data)
      .subscribe(
        (account) => {
          this.flash.success('Company information was successfully saved.');
          this.form.markAsPristine();
          this.isLoading = false;
        },
        (errors) => {
          this.flash.error('Error while saving cimpany information.');
          this.isLoading = false;
        },
        () => this.isLoading = false
      );

  }

  close() {
    this.router.navigate(['/settings']);
  }

  hasChanges() {
    return this.form.dirty && this.form.touched;
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

  onLogoChange(event) {
    this.onFileChange(event);

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      let json = JSON.parse(JSON.parse(response));
      this.patchFormValue(this.form, {logo: json.url}, true);
    };
  }

  onBackgroundChange(event) {
    this.onFileChange(event);

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      let json = JSON.parse(JSON.parse(response));
      this.patchFormValue(this.form, {background: json.url}, true);
    };
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
