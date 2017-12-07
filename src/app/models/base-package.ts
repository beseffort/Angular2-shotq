export class BasePackage {
  id?: number;
  created?: Date;
  modified?: Date;
  account: number;
  name: string;
  description?: string;
  price: number | string;
  manual_price?: boolean;
  cogs_total?: number;
  profit_margin?: number;
  shipping_cost?: number;
  categories?: number[];
}
