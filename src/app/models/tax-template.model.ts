import { DiscountTemplate, RETAIL_PRICE } from './discount-template.model';
import { Tax } from './tax.model';

export const amountChoices = [
  {value: 'Percentage Rate', label: 'Tax by Percentage Rate'},
  {value: 'Fixed Dollar Amount', label: '​Tax by Fixed Dollar Amount'},
];

export const calculationChoices = [
  {value: 'Products', label: 'Products'},
  {value: 'Services', label: 'Services'},
  // {value: 'Products & Services', label: 'Product & Services'},

];

export const calculationAgainstChoices = [
  {value: 'The Final Subtotal', label: 'Calculate tax against the final subtotal'},
  {value: RETAIL_PRICE, label: 'Calculate tax against the retail price of product and services'},
];

export const paymentScheduleSettings = [
  {value: 'As Lump Sum on the Final Payment', label: 'Apply tax as a lump sum on the final payment'},
  {value: 'Proportionally on Each Payment', label: 'Apply tax proportionally on each payment'},
];

export class TaxTemplate extends DiscountTemplate {
  tax?: Tax;
  additional_rates?: number[];
}
