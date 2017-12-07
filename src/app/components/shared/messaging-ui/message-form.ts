import * as _ from 'lodash';
import { FormGroup } from '@angular/forms';
import { SentCorrespondenceService } from '../../../services/sent-correspondence/sent-correspondence.service';
import { Contact } from '../../../models/contact';
import { Job } from '../../../models/job';
import { EmailTemplate } from '../../../models/email-template.model';
import { Message } from '../../../models/sentcorrespondence';
import {
  Recipient, RECIPIENT_TYPE_BCC,
  RECIPIENT_TYPE_CC, RECIPIENT_TYPE_TO, RecipientType
} from '../../../models/recipient';

type EmailOrId = number | string;

/**
 * The form context is basically a container for the data of some ContentType
 * to be displayed in some FormGroup object. It implements the passing data
 * from the content object to the form and vice versa.
 *
 * The real benefits from usage of the form context could be achieved when
 * the content object has to be presented as a part of a larger form along with
 * other content object(s).
 *
 * For example a Contact form could be a part of a Job details form. In this case
 * there could be two context objects, one for the contact details and one for
 * the job details.
 */
interface FormContext<ContentType> {
  /**
   * Updates the context values from the content object.
   * This method should not touch any forms yet.
   *
   * @param content The source content object.
   */
  resetFromContent(content: ContentType): void;

  /**
   * Resets the form values with the data stored in the context.
   *
   * @param form - target form to be updated
   * @param extra - additional data to apply to the form. It could be used
   * to override the context values or to add form field values
   * that is not present in the context.
   */
  applyToForm(form: FormGroup, extra?: object): void;

  /**
   * Reads the form values and transform it to the content object.
   * @param form The source form to read the data,
   */
  getFormSubmitValue(form: FormGroup): ContentType;
}

export class MessageFormContext implements FormContext<Message> {
  subject: string = '';
  body: string = '';
  template: EmailTemplate;
  job: Job;
  recipients: object[] = [];
  private _addressBook: Contact[];
  private jobId: number;
  private content: Message;

  static createForMessage(content: Message): MessageFormContext {
    let instance = new MessageFormContext();
    instance.resetFromContent(content);
    return instance;
  }

  set addressBook(value: Contact[]) {
    this._addressBook = value;
  }

  resetFromContent(content: Message): void {
    this.content = content;
    this.subject = content.subject;
    this.body = content.body;
    this.jobId = content.job;
  }

  applyToForm(form: FormGroup, extra?: object): void {
    let recipients = _.map(this.content.recipients as Recipient[], item => {
      return {
        contact: _.find(this._addressBook, ['id', item.contact_id]) || Contact.Empty,
        type: item.recipient_type
      };
    });
    form.setValue(Object.assign({
      subject: this.subject || '',
      body: this.body || '',
      recipients: this.getRecipientsFormValueByType(recipients, RECIPIENT_TYPE_TO),
      ccRecipients: this.getRecipientsFormValueByType(recipients, RECIPIENT_TYPE_CC),
      bccRecipients: this.getRecipientsFormValueByType(recipients, RECIPIENT_TYPE_BCC)
    }, extra || {}));
  }

  getFormSubmitValue(form: FormGroup): Message {
    return SentCorrespondenceService.newObject({
      // account: this.apiService.getAccount(),
      subject: form.value.subject,
      correspondence_types: [],
      body: form.value.body,
      template: this.template ? this.template.id : null,
      job: this.job ? this.job.id : null,
      recipients: this.getRecipientsSubmitValue(form.value.recipients),
      cc_recipients: this.getRecipientsSubmitValue(form.value.ccRecipients),
      bcc_recipients: this.getRecipientsSubmitValue(form.value.bccRecipients)
    });
  }

  private getRecipientsFormValueByType(recipients, type: RecipientType): object[] {
    return _.chain(recipients)
      .filter(['type', type])
      .map(item => {
        return {value: item['contact'].id, display: item['contact'].fullName};
      }).value();
  }

  /**
   * Converts the array of recipients contact ID to the array of contact email ID.
   */
  private getRecipientsSubmitValue(recipients: object[]): EmailOrId[] {
    let contactIds = _.map(recipients, 'value');
    let emails = _.filter(contactIds, _.isString);
    let emailIds = _.chain(this._addressBook)
      .filter(item => contactIds.indexOf(item.id) >= 0)
      .map('default_email')
      .value() as number[];
    return _.union(emailIds, emails) as EmailOrId[];
  }
}
