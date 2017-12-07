import { ProposalSchedulePaymentItem } from './proposal-schedule-payment-item';
import { ProposalSchedulePaymentTemplate } from './proposal-schedule-payment-template';


export interface ProposalSchedulePayment extends ProposalSchedulePaymentTemplate {
  proposal: number;
  payments: ProposalSchedulePaymentItem[];
}
