import { Component, forwardRef, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { Observable } from 'rxjs/Observable';
import { DialogRef } from 'single-angular-modal/esm';

import { ApiService } from 'app/services';
import { Contact } from '../../../models/contact';
import { EmailTemplate } from '../../../models/email-template.model';
import { Message, MessageAttachment } from '../../../models/sentcorrespondence';
import { GeneralFunctionsService } from '../../../services/general-functions/general-functions.service';
import { BaseDialogContext, BaseDialogImplementation } from '../dialog';
import { MessageFormContext } from './message-form';
import { MessagingUiService } from './messaging-ui.service';
import {
  RECIPIENT_TYPE_BCC, RECIPIENT_TYPE_CC, RECIPIENT_TYPE_TO
} from '../../../models/recipient';

export const enum DisplayMode {
  View, Compose
}

export class ComposeMessageDialogContext extends BaseDialogContext<Message> {
  public content: Message;
  public displayMode: DisplayMode = DisplayMode.View;
}

const EMAIL_REGEXP = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;


function isValidEmail(value) {
  return _.isString(value) && EMAIL_REGEXP.test(value);
}


@Component({
  selector: 'compose-message-dialog',
  styleUrls: ['./compose-message-dialog.component.scss'],
  templateUrl: './compose-message-dialog.component.html',
  providers: []
})
export class ComposeMessageDialogComponent
    extends BaseDialogImplementation<Message, ComposeMessageDialogContext>
    implements OnInit {
  private messageFormData: MessageFormContext;
  //noinspection JSMismatchedCollectionQueryUpdate
  private templates: EmailTemplate[] = [];
  private selectedTemplate: EmailTemplate = null;
  private selectedTemplateName: string = '';
  private files: MessageAttachment[] = [];
  private isLoading: boolean = false;
  //noinspection JSUnusedLocalSymbols
  private isHeaderExpanded: boolean = false;
  private uploader: FileUploader;
  // Template rendering engine requires an event ID in order to render a template.
  // So templates are enabled only if the event is set and the template list
  // isn't empty.
  private templatesEnable = false;
  private perms: object = {
    attach: true,  // the user can add and manage attached files
    reply: false  // the user can replay to a message while they are in the view mode
  };

  // constants to use in the template
  private readonly COMPOSE = DisplayMode.Compose;
  private readonly VIEW = DisplayMode.View;

  get message(): Message {
    return this.context.content;
  }

  // a shortcut to the `context.displayMode`
  //noinspection JSUnusedGlobalSymbols
  get displayMode(): DisplayMode {
    return this.context.displayMode;
  }

  set displayMode(value: DisplayMode) {
    this.context.displayMode = value;
  }

  constructor(dialog: DialogRef<ComposeMessageDialogContext>,
      @Inject(forwardRef(() => MessagingUiService)) private presenter: MessagingUiService,
      private generalFunctions: GeneralFunctionsService,
      private apiService: ApiService) {
    super(dialog, 'sq-compose-message-dialog');
    this.uploader = new FileUploader({
      url: this.apiService.apiUrl + '/storage/file/',
      authToken: this.apiService.getOauthAutorization()
    });
    // Add the account ID to the form because the API endpoint requires it
    // to upload any file.
    this.uploader.onBuildItemForm = (fileItem, form) => {
      form.append('account', this.apiService.auth.id);
    };
    this.uploader.onSuccessItem = (item, response, status, headers) => {
      this.addFile(JSON.parse(response));
    };

    this.uploader.onErrorItem = (item, response, status, headers) => {
      this.presenter.displayErrorMessage(`Error uploading ${item.file.name}.`);
    };

    this.uploader.onCompleteAll = () => {
      // event.target.value = '';
      this.uploader.clearQueue();
      this.isLoading = false;
    };
  }

  ngOnInit(): void {
  }

  createForm(): FormGroup {
    return super.createForm({
      subject: new FormControl('', Validators.compose([
        Validators.required,
        Validators.maxLength(128)
      ])),
      body: new FormControl('', Validators.required),
      recipients: new FormControl([], Validators.required),
      ccRecipients: new FormControl([]),
      bccRecipients: new FormControl([]),
    });
  }

  setViewValue(content: Message) {
    // create the form data for the message and update the form with that data
    this.messageFormData = MessageFormContext.createForMessage(content);
    this.messageFormData.applyToForm(this.form);
    // reset the attachments
    this.files.length = 0;
    _.each(content.files_data, this.addFile.bind(this));
    // After the form context is created we can reset its dictionaries
    // whenever the data is arrived.
    this.presenter.addressBook$.subscribe(this.resetContacts.bind(this));
    this.presenter.event$.subscribe(() => this.resetTemplates(this.presenter.templates));
    this.presenter.templates$.subscribe(this.resetTemplates.bind(this));
  }

  getSubmitValue(content: Message): Message {
    let result = this.messageFormData.getFormSubmitValue(this.form);
    result.files = _.map(this.files, 'id');
    return result;
  }

  private resetContacts(contacts: Contact[]): void {
    this.messageFormData.addressBook = contacts.slice();
    this.messageFormData.applyToForm(this.form);
  }

  private resetTemplates(templates: EmailTemplate[]): void {
    this.templates = templates.slice();
    this.templatesEnable = this.templates.length > 0;
  }

  //noinspection JSUnusedLocalSymbols
  private createSuggestContactsCallback() {
    let self = this;
    return suggestContacts;

    // See the [`tag-input` documentation](http://bit.ly/2s9kjAY) for details.
    function suggestContacts(text: string) {
      let searchText = text.toLocaleLowerCase();
      return self.presenter.addressBook$
        .map(contacts => {
          return _.chain(contacts)
            // list contacts with the default email and the contact name
            // containing th search text
            .filter(item => {
              return _.isNumber(item.default_email) &&
                item.fullName.toLocaleLowerCase().indexOf(searchText) >= 0;
            })
            // convert them to the format suitable to display on the `tag-input`
            .map(item => {
              return {value: item.id, display: item.fullName, email: item.defaultEmail};
            })
            .value();
        });
    }
  }

  //noinspection JSUnusedLocalSymbols
  private createOnAddingCallback() {
    let self = this;
    return onAdding;

    function onAdding(tag): Observable<any> {
      if (_.isObject(tag) && _.isNumber(tag['value']) || isValidEmail(tag))
        // Unfortunately the tag input ignores `value` property of the returned
        // object, so we cannot substitute the email to an existing contact.
        return Observable.of(tag);
      // Do not allow to add the tag if it's neither a valid email nor a contact
      return Observable.empty();
    }
  }

  private onReply() {
    // https://zpl.io/1EcJBM
    // switch to compose mode; display template selector and the save options
    this.displayMode = DisplayMode.Compose;
  }

  private onSave() {
  }

  private onSend() {
  }

  //noinspection JSUnusedLocalSymbols
  private onAddAttachment(event) {
    if (event.target.files.length === 0) {
      this.uploader.clearQueue();
      return;
    }
    // this.validateFiles(this.uploader.queue);
    // if (!this.uploader.queue.length) return;
    //
    this.isLoading = true;
    for (let fileItem of this.uploader.queue) {
      fileItem.withCredentials = false;
      fileItem.upload();
    }
  }

  //noinspection JSUnusedLocalSymbols
  private onRemoveAttachmentById(id: number) {
    _.remove(this.files, item => item.id === id);
  }

  private addFile(file: MessageAttachment) {
    this.files.push(Object.assign({}, file, {
      $formattedSize: this.generalFunctions.formatFileSize(file.file_size)
    }));
  }

  private onCreateTemplate() {
    // start editing the template name, replace 'Save as new template' with 'Cancel'
  }

  private onToggleDetails() {
    // show/hide the CC and BCC section
  }

  //noinspection JSUnusedLocalSymbols
  private onTemplateSelected(template) {
    // render the template text; replace the message with the rendered text
    let messageCopy = _.cloneDeep(this.message);
    this.selectedTemplate = template;
    this.selectedTemplateName = template.name;
    messageCopy.template = template.id;
    messageCopy.files = template.attachments.slice();
    messageCopy.files_data = template.attachments_data.slice();
    messageCopy.subject = template.subject ? template.subject : messageCopy.subject;
    messageCopy.body = template.contents ? template.contents : messageCopy.body;
    const toNormalized = this.presenter.normalizeEmail(template.to);
    const ccNormalized = this.presenter.normalizeEmail(template.cc);
    const bccNormalized = this.presenter.normalizeEmail(template.bcc);
    this.presenter.getContactsByEmailAddress([toNormalized, ccNormalized, bccNormalized])
      .subscribe(contactsByEmail => {
        if (!contactsByEmail)
          return;
        let recipients = [];
        let contact = _.head(contactsByEmail[toNormalized]) as Contact;
        if (contact)
          recipients.push({contact_id: contact.id, recipient_type: RECIPIENT_TYPE_TO});
        contact = _.head(contactsByEmail[ccNormalized]) as Contact;
        if (contact)
          recipients.push({contact_id: contact.id, recipient_type: RECIPIENT_TYPE_CC});
        contact = _.head(contactsByEmail[bccNormalized]) as Contact;
        if (contact)
          recipients.push({contact_id: contact.id, recipient_type: RECIPIENT_TYPE_BCC});
        messageCopy.recipients = recipients;
      });
    this.presenter.renderTemplate(template)
      .subscribe(body => {
        messageCopy.body = body;
        this.setViewValue(messageCopy);
      });
  }
}
