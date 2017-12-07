import { Job } from './job';

type ContractStatus = 'draft' | 'viewed' | 'sent' | 'pending' | 'signed' | 'archived' | 'deleted';

// LegalDocumentSerializer
export class Contract {
  static readonly Empty: Contract = Object.assign(new Contract(), {id: -1});
  static readonly STATUS_DRAFT: ContractStatus = 'draft';
  static readonly STATUS_VIEWED: ContractStatus = 'viewed';
  static readonly STATUS_SENT: ContractStatus = 'sent';
  static readonly STATUS_PENDING: ContractStatus = 'pending';
  static readonly STATUS_SIGNED: ContractStatus = 'signed';
  static readonly STATUS_ARCHIVED: ContractStatus = 'archived';
  static readonly STATUS_DELETED: ContractStatus = 'deleted';
  id?: number;
  account?: number;
  title?: string;
  contents?: string;
  billing_order?: any;
  job?: number | any;
  template?: number;
  created?: Date;
  modified?: Date;
  contacts?: number[];
  job_data?: Job;
  status?: ContractStatus;
  email_subject: string = '';
  email_contents: string = '';

  get isDraft(): boolean {
    return this.status === Contract.STATUS_DRAFT;
  }

  get isViewed(): boolean {
    return this.status === Contract.STATUS_VIEWED;
  }

  get isSent(): boolean {
    return this.status === Contract.STATUS_SENT;
  }

  get isPending(): boolean {
    return this.status === Contract.STATUS_PENDING;
  }

  get isSigned(): boolean {
    return this.status === Contract.STATUS_SIGNED;
  }

  get isArchived(): boolean {
    return this.status === Contract.STATUS_ARCHIVED;
  }
}
