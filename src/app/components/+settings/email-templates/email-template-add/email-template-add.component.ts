import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { FileUploader } from 'ng2-file-upload';
import { FileItem } from 'ng2-file-upload/components/file-upload/file-item.class';
import { ModalDirective } from 'ngx-bootstrap';

import { TinymceComponent } from '../../../shared/tinymce-editor/tinymce-editor.component';
import { EmailTemplate } from '../../../../models/email-template.model';
import { EmailTemplateService } from 'app/services/email-template';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import { CURRENT_PROFILE_ID } from '../../../../services/access/access.service';
import { SignalService } from 'app/services/signal-service/signal.service';
import { ApiService } from '../../../../services/api/api.service';
import { TemplateVariable } from '../../../../models/template-variable.model';
import { FileService } from '../../../../services/file/file.service';
import { GeneralFunctionsService } from '../../../../services/general-functions/general-functions.service';


declare let tinymce: any;


@Component({
  selector: 'app-email-template-add',
  templateUrl: './email-template-add.component.html',
  styleUrls: ['./email-template-add.component.scss'],

})
export class EmailTemplateAddComponent {
  @ViewChild('modal') modal: ModalDirective;
  @ViewChild(TinymceComponent) tinymceEditor: TinymceComponent;

  template: EmailTemplate | any = {};
  initialTemplate: EmailTemplate | any = {};
  tempContents: string = '';
  variablesList: TemplateVariable[] = [];

  isLoading: boolean = true;
  isContactsActive: boolean = false;
  showVariablesBlock: boolean = false;
  readOnly: boolean = false;
  editableMode: string = 'active';
  mode: string = 'view';

  uploader: FileUploader;

  private alertify = require('../../../../assets/theme/assets/vendor/alertify-js/alertify.js');


  constructor(public generalFunctions: GeneralFunctionsService,
              private templateService: EmailTemplateService,
              private fileService: FileService,
              private flash: FlashMessageService,
              private router: Router,
              private signal: SignalService,
              private apiService: ApiService) {
    this.uploader = new FileUploader({
      url: this.apiService.apiUrl + '/storage/upload/' + this.apiService.auth.id + '/',
      authToken: this.apiService.getOauthAutorization()
    });

    this.alertify.theme('bootstrap-shootq');
    this.alertify.okBtn('OK');
  }

  ngOnInit() {
    this.modal.onShown.subscribe(() => {
      if (!this.readOnly)
        this.tinymceEditor.focus();
    });
  }

  getTemplate(id?: number) {
    this.isLoading = true;

    if (id)
      return this.templateService.get(id);

    return Observable.create(observer => {
      observer.next({account: CURRENT_PROFILE_ID, contents: '', attachments: [], attachments_data: []});
      this.isLoading = false;
      observer.complete();
    });
  }

  saveAttachments() {
    let attachmentsToSave = _.filter(this.template.attachments_data, {id: undefined});

    this.isLoading = true;
    if (!attachmentsToSave.length)
      return Observable.create(observer => {
        observer.next([]);
        observer.complete();
      });

    return this.fileService.bulkCreate(attachmentsToSave);
  }

  saveTemplate() {
    let method = !!this.template.id ? this.templateService.save : this.templateService.create;

    method.bind(this.templateService)(this.template)
      .subscribe((template: EmailTemplate) => {
        this.isLoading = false;
        this.modal.hide();

        this.signal.send({
          group: 'emailTemplate',
          type: !!this.template.id ? 'edit' : 'add',
          instance: template
        });
        this.flash.success('Template saved successfully.');
      }, error => {
        this.flash.error('Error saving template.');
        this.isLoading = false;
      }, () => this.isLoading = false);
  }

  updateAttachmentData(uploadedAttachments) {
    let newAttachmentIds = _.map(uploadedAttachments, 'id');
    // Update attachments data for current template
    this.template.attachments = newAttachmentIds.concat(this.template.attachments);
    _.remove(this.template.attachments_data, (attach) => !attach['id']);
    this.template.attachments_data = this.template.attachments_data.concat(uploadedAttachments);
  }

  persistTemplate(template: any) {
    this.template = template;
    this.initialTemplate = Object.assign({}, template);
    this.tempContents = template.contents;
  }

  save() {
    this.template.contents = this.tinymceEditor.getContents();
    this.isLoading = true;
    this.saveAttachments()
      .subscribe((attachments) => {
        this.updateAttachmentData(attachments);
        this.saveTemplate();
      });
  }

  onContentsChange(val: string) {
    this.tempContents = val;
  }

  show(template?: any, mode: string = 'view') {
    let id = template ? template.id : null;

    this.mode = template ? mode : 'edit';
    this.readOnly = this.mode !== 'edit';
    this.editableMode = this.readOnly ? 'inactive' : 'active';
    this.showVariablesBlock = false;

    this.getTemplate(id)
      .subscribe((instance: EmailTemplate) => {
          this.isLoading = false;
          this.persistTemplate(instance);
          this.modal.show();
          jQuery('.modal-backdrop').addClass('modal-backdrop_grey');
        },
        error => {
          let res = error.json();
          this.flash.error(res.detail || res.message);
          this.router.navigate(['/settings', 'templates', 'contract']);
        }
      );

    this.templateService
      .listGet('variables')
      .subscribe((result) => {
        this.variablesList = result;
      });
  }

  hide() {
    if (!this.hasChanges() || this.mode === 'view') {
      this.modal.hide();
      return;
    }

    this.alertify.confirm(
      'Are you sure you want to leave this page? All unsaved changes will be lost.',
      () => { this.modal.hide(); }
    );
  }

  hasChanges() {
    let attachmentsToSave = _.filter(this.template.attachments_data, {id: undefined});
    return !_.isEqual(this.initialTemplate, this.template) || attachmentsToSave.length;
  }

  toggleContacts() {
    this.isContactsActive = !this.isContactsActive;
  }

  enterEditMode() {
    this.readOnly = false;
    this.editableMode = 'active';
    this.mode = 'edit';
    setTimeout(() => this.tinymceEditor.focus());
  }

  onClickOutsideVariables(event) {
    this.showVariablesBlock = false;
    event.stopPropagation();
  }

  onAttachmentsChange(event) {
    if (event.target.files.length === 0) {
      this.uploader.clearQueue();
      return;
    }

    this.validateFiles(this.uploader.queue);
    if (!this.uploader.queue.length) return;

    this.isLoading = true;
    for (let fileItem of this.uploader.queue) {
      fileItem.withCredentials = false;
      fileItem.upload();
    }

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      let json = JSON.parse(JSON.parse(response));
      this.template.attachments_data.push({
        id: undefined,
        account: CURRENT_PROFILE_ID,
        filename: item.file.name,
        url: json.url,
        file_size: item.file.size,
        sha_hash: ''
      });
    };

    this.uploader.onErrorItem = (item, response, status, headers) => {
      this.flash.error(`Error uploading ${item.file.name}.`);
    };

    this.uploader.onCompleteAll = () => {
      this.isLoading = false;
      event.target.value = '';
      this.uploader.clearQueue();
    };
  }

  validateFiles(items: FileItem[], maxsize: number = 5000000): void {
    let occupiedSpace = _.sum(_.map(this.template.attachments_data, 'file_size')),
      uploadedSize = _.sum(_.map(items, (item) => { return item.file.size; }));

    // There is a limit of 10MB for all attachments
    if (occupiedSpace + uploadedSize > 10000000) {
      this.flash.error('There is a limit of 10MB for all attachments.');
      this.uploader.clearQueue();
      return;
    }

    for (let item of items) {
      if (item.file.size > maxsize) {
        this.flash.error(`${item.file.name} is bigger than 5MB and will not be uploaded.`);
        item.remove();
      }
    }
  }

  removeAttachment(attachment) {
    this.isLoading = true;

    _.remove(this.template.attachments_data, attachment);
    if (attachment.id)
      this.template.attachments.splice(this.template.attachments.indexOf(attachment.id), 1);

    this.isLoading = false;
    this.flash.success('Attachment removed successfully.');
  }
}
