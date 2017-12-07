import { ProposalSchedulePayment } from './proposal-schedule-payment'


export interface ProposalSchedulePaymentValidaton {
  price?: number;
  subtotal?: number;
  shipping_price?: number;
  autocorrect?: boolean;
}
