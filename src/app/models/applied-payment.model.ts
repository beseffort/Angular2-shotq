export interface AppliedPayment {
  id: number;
  account: number;
  amount: number;
  contact: number;
  created: Date;
  due: Date;
  invoice: number;
  modified: Date;
  status: string;
  external_payment: any;

}
