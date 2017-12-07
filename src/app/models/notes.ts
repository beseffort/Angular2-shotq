import { BaseUserProfile } from './user';
export class BaseNote {
  public static readonly Empty = new BaseNote(-1, '', '');

  id: number;
  subject: string;
  body: string; // Required
  is_edited: boolean;
  created: Date;
  modified: Date;
  created_by: any;
  created_by_data: BaseUserProfile;
  last_modified_by: any;
  last_modified_by_data: BaseUserProfile;

  constructor(id: number, subject: string, body: string) {
    this.id = id;
    this.subject = subject;
    this.body = body;
  }
}
