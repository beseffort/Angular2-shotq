import { ItemTemplate } from './item-template';


export class PackageTemplateItem {
  id?: number;
  created?: Date;
  modified?: Date;
  quantity: number;
  item_template: number; /*(required)*/
  item_template_data?: ItemTemplate;
  package_template?: number;
  addons_price?: number | string;
}
