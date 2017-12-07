import { BaseItemOptionGroup } from './base-item-option-group';
import { ItemOption } from './item-option';

export interface ItemOptionGroup extends BaseItemOptionGroup {
  item: number;
  selected: number;
  selected_data?: ItemOption;
  options: ItemOption[];
}
