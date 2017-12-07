import * as _ from 'lodash';
import {
  Recipient, RECIPIENT_TYPE_BCC, RECIPIENT_TYPE_CC,
  RECIPIENT_TYPE_TO
} from './recipient';

export const CORRESPONDENCE_TYPE_CONTRACT = 'contract';
export const CORRESPONDENCE_TYPE_PROPOSAL = 'proposal';
export const CORRESPONDENCE_TYPE_QUESTIONNAIRE = 'questionnaire';

type RecipientOrId = Recipient | number;

// storage_api_v1.serializers.FileSerializer
export interface MessageAttachment {
  id: number;
  created: string;
  modified: string;
  storage_backend: 'local' | 's3';
  filename: string;
  sha_hash: string;
  file_size: number;
  key: string;  // random UID of the file
  url: string;
  account: number;
}

export class Message {
  id?: number;
  created: string;
  modified: string;
  account: number;
  brand?: number;
  subject: string;
  correspondence_types: string[];
  sender_email?: number;
  body: string;
  template?: number;
  job?: number;
  recipients: RecipientOrId[];
  files: number[];  // list of FK to `storage.File` objects
  files_data: MessageAttachment[];

  get toRecipients(): RecipientOrId[] {
    return _.filter(this.recipients, item => {
      return !_.isNumber(item) && item.recipient_type === RECIPIENT_TYPE_TO;
    });
  }

  get ccRecipients(): RecipientOrId[] {
    return _.filter(this.recipients, item => {
      return !_.isNumber(item) && item.recipient_type === RECIPIENT_TYPE_CC;
    });
  }

  get bccRecipients(): RecipientOrId[] {
    return _.filter(this.recipients, item => {
      return !_.isNumber(item) && item.recipient_type === RECIPIENT_TYPE_BCC;
    });
  }
}

// correspondence_api_v1.SentCorrespondenceSerializer
export class SentCorrespondence extends Message {
  success: boolean;
  sent: string;
  sender_name: string;
}
