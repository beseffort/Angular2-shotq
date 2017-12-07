import { MerchantAccount } from './merchant-account';
import { ProposalSchedulePaymentTemplate } from './proposal-schedule-payment-template';
import { DiscountTemplate } from './discount-template.model';
import { TaxTemplate } from './tax-template.model';

export interface ProposalSettingTemplate {
  id?: number;
  name: string;
  account: number;
  merchant_account?: MerchantAccount;
  pay_with_check: boolean;
  collect_manually: boolean;
  schedule_template: ProposalSchedulePaymentTemplate;
  discount_templates: DiscountTemplate[];
  tax_template?: TaxTemplate;
}
