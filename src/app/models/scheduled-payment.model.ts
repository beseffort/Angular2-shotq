export interface ScheduledPayment {
  id: number;
  account: number;
  amount: number;
  paid: number;
  balance: number | string;
  contact: number;
  created: Date;
  due: Date;
  invoice: number;
  modified: Date;
  status: string;
  overdue?: boolean;

  _buttonOpen: boolean;
  _actions: any[];
  _humanizedStatus?: string;
}
