import { DiscountTemplate } from './discount-template.model';
export class Discount extends DiscountTemplate {
  account?: number;
  amount?: number;
  proposal: number;

}
