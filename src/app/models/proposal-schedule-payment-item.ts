import { MyDatepickerDate } from './mydatepicker-model';
import { BaseProposalSchedulePaymentItem } from './base-proposal-schedule-payment-item';

export interface ProposalSchedulePaymentItem extends BaseProposalSchedulePaymentItem {
  paid_date?: MyDatepickerDate;
  payment_method?: string;
  transaction_id?: string;
  payment_description?: string;
}
