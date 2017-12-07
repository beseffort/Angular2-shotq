import * as _ from 'lodash';
import { Injectable, ViewContainerRef } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import { DialogRef, overlayConfigFactory } from 'single-angular-modal/esm';
import { Modal } from 'single-angular-modal/plugins/bootstrap';
import {
  ComposeMessageDialogComponent, ComposeMessageDialogContext, DisplayMode
} from './compose-message-dialog.component';
import { Contact } from '../../../models/contact';
import { Message } from '../../../models/sentcorrespondence';
import { ContactService } from '../../../services/contact/contact.service';
import { EmailTemplate } from '../../../models/email-template.model';
import { EmailTemplateService } from '../../../services/email-template/email-template.service';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';
import { BaseEvent, Event } from '../../../models/event';
import { ApiService } from '../../../services/api/api.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

const VARIABLE_TAG_START: string = '{{';
const VARIABLE_TAG_END: string = '}}';

@Injectable()
export class MessagingUiService {
  addressBook$: Observable<Contact[]>;
  event$: Observable<BaseEvent>;
  templates$: Observable<EmailTemplate[]>;

  private addressBookSubject = new BehaviorSubject<Contact[]>([]);
  private eventSubject = new BehaviorSubject<BaseEvent>(Event.Empty);
  private templatesSubject = new BehaviorSubject<EmailTemplate[]>([]);
  private messageDialog: DialogRef<any> = null;

  constructor(private modal: Modal,
              private apiService: ApiService,
              private contactService: ContactService,
              private emailTemplateService: EmailTemplateService,
              private flash: FlashMessageService) {
    this.event$ = this.eventSubject.asObservable();
    // init the address book stream
    this.addressBook$ = this.addressBookSubject.asObservable();
    this.contactService.remoteDataHasChanged
      .subscribe(this.fetchAddressBook.bind(this));
    this.fetchAddressBook();

    // init the email templates stream
    this.templates$ = this.templatesSubject.asObservable();
    this.emailTemplateService.remoteDataHasChanged
      .subscribe(this.fetchEmailTemplates.bind(this));
    this.fetchEmailTemplates();
  }

  get event(): BaseEvent {
    return this.eventSubject.value;
  }

  set event(value: BaseEvent) {
    this.eventSubject.next(value);
  }

  get templates(): EmailTemplate[] {
    return this.templatesSubject.getValue();
  }

  public displaySuccessMessage(message: string): void {
    this.flash.success(message);
  }

  public displayErrorMessage(message: string): void {
    this.flash.error(message);
  }

  public displayComposeMessageDialog(content: Message, vcRef?: ViewContainerRef):
      Observable<Message> {
    return this.displayMessageDialog(content, DisplayMode.Compose, vcRef);
  }

  public displayViewMessageDialog(content: Message, vcRef?: ViewContainerRef):
      Observable<Message> {
    return this.displayMessageDialog(content, DisplayMode.View, vcRef);
  }

  public displayMessageDialog(content: Message, mode: DisplayMode, vcRef?: ViewContainerRef):
      Observable<Message> {
    let result = new Subject<Message>();
    if (this.messageDialog && !this.messageDialog.destroyed) {
      this.messageDialog.destroy();
      this.messageDialog = null;
    }
    let config = overlayConfigFactory(
      {content: content, displayMode: mode}, ComposeMessageDialogContext);
    if (vcRef) {
      config.viewContainer = vcRef;
    }
    this.modal.open(ComposeMessageDialogComponent, config)
      .then(dialog => {
        this.messageDialog = dialog;
        dialog.result.then(data => {
          result.next(data);
          result.complete();
        }, () => { result.complete(); });
      }, () => { result.complete(); });
    return result;
  }

  public normalizeEmail(emailAddress: string): string {
    return (emailAddress || '').toLowerCase();
  }

  public getContactsByEmailAddress(email: string[]) {
    const normalizedEmails = _.map(email, this.normalizeEmail.bind(this));
    return this.addressBook$
      .map(contacts => {
        let retval = {};
        _.each(contacts, contact => {
          _.each(contact.emails, emailObj => {
            let val = this.normalizeEmail(emailObj.address);
            if (normalizedEmails.indexOf(val) >= 0)
              if (retval[val])
                retval[val].push(contact);
              else
                retval[val] = [contact];
          });
        });
        return retval;
      });
  }

  //noinspection JSMethodCanBeStatic
  public templateContainsVariables(template: EmailTemplate): boolean {
    return !!template.contents &&
      template.contents.indexOf(VARIABLE_TAG_START) >= 0 &&
      template.contents.indexOf(VARIABLE_TAG_END) >= 0;
  }

  /**
   * Renders the email template.
   *
   * If the template doesn't contain any variable it will be rendered immediately
   * without hitting the server.
   * To successfully render the template with variables the `event` object must be
   * set by the client to a non-empty value before the method is called.
   *
   * @param template {EmailTemplate} The template to render.
   * @return {string} An observable object which emits a string of the rendered
   * template contents.
   */
  public renderTemplate(template: EmailTemplate): Observable<string> {
    let eventAvailable = _.isObject(this.event) && this.event.id > 0;
    if (!this.templateContainsVariables(template) || !eventAvailable) {
      // the template seems has no variables, or the template couldn't be
      // rendered on the server, so don't bother to send a request
      return Observable.of(template.contents);
    }
    let searchParams = new URLSearchParams();
    if (eventAvailable)
      searchParams.set('event_id', this.event.id.toString());
    let url = `/template/email_template/${ template.id }/render/?` + searchParams.toString();
    return this.apiService.get(url).map(response => response.contents);
  }

  private fetchAddressBook() {
    this.contactService.getList({active: true, archived: false})
      .map(response => _.map(response.results, ContactService.newObject))
      .subscribe(value => this.addressBookSubject.next(value));
  }

  private fetchEmailTemplates() {
    this.emailTemplateService.getList()
      .map(response => {
        return _(response.results)
          .map(EmailTemplateService.newObject)
          .filter({isDraft: true})
          .value();
      })
      .subscribe(value => this.templatesSubject.next(value));
  }
}
