import { ProposalSchedulePaymentItemTemplate } from './proposal-schedule-payment-item-template';


export interface ProposalSchedulePaymentTemplate {
  id?: number;
  title: string;
  account: number;
  payments: ProposalSchedulePaymentItemTemplate[];
}
