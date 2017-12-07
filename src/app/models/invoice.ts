import { MerchantAccount } from './merchant-account';
export interface Invoice {
  account: number;
  pay_with_check?: boolean;
  collect_manually?: boolean;
  merchant_account?: number;
  merchant_account_details?: MerchantAccount;
  payment_settings: {
    pay_with_check: boolean;
    collect_manually: boolean;
  };
  id?: number;
}
