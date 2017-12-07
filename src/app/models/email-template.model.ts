type TemplateStatus = 'draft' | 'archived' | 'deleted';

export class EmailTemplate {
  static readonly Empty: EmailTemplate = Object.assign(new EmailTemplate(), {id: -1});
  static readonly STATUS_DRAFT: TemplateStatus = 'draft';
  static readonly STATUS_ARCHIVED: TemplateStatus = 'archived';
  static readonly STATUS_DELETED: TemplateStatus = 'deleted';
  id: number;
  name: string;
  subject: string;
  contents: string;
  color?: string;
  account?: number;
  created: Date;
  modified: Date;
  to?: string;
  cc?: string;
  bcc?: string;
  send_me_copy?: boolean;
  status: TemplateStatus;

  //noinspection JSUnusedGlobalSymbols
  get isDraft(): boolean {
    return this.status === EmailTemplate.STATUS_DRAFT;
  }

  get isDeleted(): boolean {
    return this.status === EmailTemplate.STATUS_DELETED;
  }

  get isArchived(): boolean {
    return this.status === EmailTemplate.STATUS_ARCHIVED;
  }
}
