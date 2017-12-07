import { Item } from './item';
import { ItemOptionGroup } from './item-option-group';

export class PackageItem {
  id?: number;
  item: number;
  package?: number;
  quantity: number;
  position?: number;
  item_data?: Item;
  option_groups?: ItemOptionGroup[];
}
