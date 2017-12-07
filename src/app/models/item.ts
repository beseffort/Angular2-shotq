import { BaseItem } from './base-item';
import { ItemOptionGroup } from './item-option-group';


export const ITEM_TYPE_PRODUCT = 'product';
export const ITEM_TYPE_SERVICE = 'service';

export class Item extends BaseItem {
  item_template?: number;
  approved?: boolean;
  quantity?: number;
  option_groups?: ItemOptionGroup[];
  total_price?: number | string;
  final_price?: number | string;
}
