import { TaxTemplate } from './tax-template.model';
export class Tax extends TaxTemplate {
  account?: number;
  amount?: number;
  final_tax?: number | string;
  proposal: number;
  template: number;
  apply_to_shipping_cost?: boolean;
  calculate_settings?: string;
}
