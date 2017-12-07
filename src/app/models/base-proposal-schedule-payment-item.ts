import { MyDatepickerDate } from './mydatepicker-model';

export interface BaseProposalSchedulePaymentItem {
  id?: number;
  title: string;
  schedule?: number;
  amount_type: string;
  amount?: string;
  due_date_type: string;
  due_date_offset?: number;
  due_date_offset_type?: string;
  due_date?: MyDatepickerDate;
}
