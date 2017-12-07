export const AMOUNT_CHOICE_PERCENTAGE_RATE = 'Percentage Rate';
export const AMOUNT_CHOICE_FIXED = 'Fixed Dollar Amount';

export const AMOUNT_CHOICES = [
  {value: AMOUNT_CHOICE_PERCENTAGE_RATE, label: '​Discount by Percentage Rate'},
  {value: AMOUNT_CHOICE_FIXED, label: '​Discount by Fixed Dollar Amount'},
];
export const APPLY_RULE_AFTER_TAXES = 'After Taxes';
export const APPLY_RULE_BEFORE_TAXES = 'Before Taxes';

export const APPLY_RULE_CHOICES = [
  {value: APPLY_RULE_AFTER_TAXES, label: 'Apply Discount ​After Taxes'},
  {value: APPLY_RULE_BEFORE_TAXES, label: 'Apply Discount Before Taxes'},
];

export const CALCULATION_CHOICE_PRODUCTS = 'Products';
export const CALCULATION_CHOICE_SERVICES = 'Services';
export const CALCULATION_CHOICE_PRODUCTS_AND_SERVICES = 'Products & Services';

export const CALCULATION_CHOICES = [
  {value: CALCULATION_CHOICE_PRODUCTS, label: 'Products'},
  {value: CALCULATION_CHOICE_SERVICES, label: 'Services'},
  {value: CALCULATION_CHOICE_PRODUCTS_AND_SERVICES, label: 'Products & Services'},
];

export const FINAL_SUBTOTAL = 'The Final Subtotal';
export const RETAIL_PRICE = 'The Retail Price of Products and Services';

export const CALCULATION_SETTINGS_CHOICES = [
  {value: FINAL_SUBTOTAL, label: 'Calculate against the final subtotal'},
  {value: RETAIL_PRICE, label: 'Calculate against the retail price of product and services'},
];


export class DiscountTemplate {
  id?: number;
  name?: string;
  account?: number;
  rate?: number|string;
  total_amount?: number|string;
  amount_by?: string;
  apply_rule?: string;
  calculate_against?: string;
  calculate_settings?: string;
}
