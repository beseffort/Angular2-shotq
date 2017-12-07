export class BaseItem {
  id?: number; /*(required)*/
  created?: Date;
  modified?: Date;
  name?: string; /*(required)*/
  description?: string; /*(required)*/
  item_type?: string;
  status?: string;
  price?: string;
  cost_of_goods_sold?: string; /*(required)*/
  shipping_cost?: string; /*(required)*/
  addons_price?: string | number;
  max_add?: number; /*(required)*/
  account?: number; /*(required)*/
  $isTemplate?: boolean;
  categories?: Array<number>;
}
