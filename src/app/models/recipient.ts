export type RecipientType = 'to' | 'cc' | 'bcc';
export const RECIPIENT_TYPE_TO: RecipientType = 'to';
export const RECIPIENT_TYPE_CC: RecipientType = 'cc';
export const RECIPIENT_TYPE_BCC: RecipientType = 'bcc';

export interface Recipient {
  id?: number;
  contact_id: number;
  recipient_type: RecipientType;
  recipient_name: string;
  email?: number;
  static_email?: string;
  correspondence?: number;
  sent_correspondence?: number;
}
