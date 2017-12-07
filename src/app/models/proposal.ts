import { Job } from './job';
import { Package } from './package';
import { Contract } from './contract';
import { Item } from './item';
import { BaseProposal } from './base-proposal';

export const EXPIRATION_TYPE_X_DAYS = 'in x days';
export const EXPIRATION_TYPE_ON_DATE = 'on date';
export const EXPIRATION_TYPE_NEVER_EXPIRE = 'never';

export const EXPIRATION_TYPE_CHOICES = [
  {value: EXPIRATION_TYPE_X_DAYS, label: 'Days'},
  {value: EXPIRATION_TYPE_ON_DATE, label: 'On Date'},
  {value: EXPIRATION_TYPE_NEVER_EXPIRE, label: 'Never Expire'}
];

type ProposalStatus = 'Draft' | 'Sent' | 'Rejected' | 'Accepted' | 'Canceled' | 'Expired' | 'Deleted';

export class Proposal extends BaseProposal {
  static readonly STATUS_DRAFT: ProposalStatus = 'Draft';
  static readonly STATUS_SENT: ProposalStatus = 'Sent';
  static readonly STATUS_REJECTED: ProposalStatus = 'Rejected';
  static readonly STATUS_ACCEPTED: ProposalStatus = 'Accepted';
  static readonly STATUS_CANCELED: ProposalStatus = 'Canceled';
  static readonly STATUS_EXPIRED: ProposalStatus = 'Expired';
  static readonly STATUS_DELETED: ProposalStatus = 'Deleted';

  status?: ProposalStatus;
  packages?: Package[];
  job: Job;
  merchant_account?: number;
  collect_manually?: boolean;
  pay_with_check?: boolean;

  expire_type?: any;
  expire_at?: Date;
  expire_days?: number;

  contract?: number;
  contract_data?: Contract;

  sent_at?: Date;
  expiration_date?: Date;
  expired?: boolean;

  email_subject?: string;
  email_contents?: string;

  approved_package?: number;
  approved_package_data?: Package;

  settings_edited?: boolean;
  addons?: Item[];

  get isDraft(): boolean {
    return this.status === Proposal.STATUS_DRAFT;
  }

  get isSent(): boolean {
    return this.status === Proposal.STATUS_SENT;
  }

  get isRejected(): boolean {
    return this.status === Proposal.STATUS_REJECTED;
  }

  get isAccepted(): boolean {
    return this.status === Proposal.STATUS_ACCEPTED;
  }

  get isCanceled(): boolean {
    return this.status === Proposal.STATUS_CANCELED;
  }

  get isExpired(): boolean {
    return this.status === Proposal.STATUS_EXPIRED;
  }

  get isDeleted(): boolean {
    return this.status === Proposal.STATUS_DELETED;
  }
}
