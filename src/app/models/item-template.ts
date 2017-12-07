import { ItemTemplateOptionGroup } from './item-template-option-group';
import { ItemTemplateImage } from './item-template-image';
import { BaseItem } from './base-item';

export class ItemTemplate extends BaseItem {
  item_count: number;
  item_template_option_groups: ItemTemplateOptionGroup[];
  images: ItemTemplateImage[];

  constructor() {
    super();
    this.name = null;
    this.description = '';
    this.item_type = 'product';
    this.status = 'active';
    this.price = '0.00';
    this.cost_of_goods_sold = '0.00';
    this.shipping_cost = '0.00';
    this.max_add = 10;
    this.account = 1;
    this.categories = [];
    this.item_template_option_groups = [];
    this.images = [];
  }
}
