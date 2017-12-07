import { BaseItemOptionGroup } from './base-item-option-group';
import { ItemTemplateOption } from './item-template-option';

export interface ItemTemplateOptionGroup extends BaseItemOptionGroup {
  item_template: number;
  item_template_options: ItemTemplateOption[];
  option_type_label: string;
  selected?: number;
  selected_data?: ItemTemplateOption;
}

export class ItemTemplateOptionGroup {
  constructor() {
    this.account = 1;
    this.description = 'example description';
    this.name = 'New Item Option';
    this.option_type = null;
    this.option_type_label = null;
    this.required = false;
    this.item_template_options = [];
  }
}
