import { BaseNote } from './notes';

export class ContactNote extends BaseNote {
  contact: number; // Required

  constructor(id: number, subject: string, body: string, contact: number) {
    super(id, subject, body);
    this.contact = contact;
  }
}
