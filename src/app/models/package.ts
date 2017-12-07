import { Item } from './item';
import { PackageItem } from './package-item';
import { BasePackage } from './base-package';

export class Package extends BasePackage {
  template?: number;
  items: PackageItem[];
  proposal?: number;
  addons?: Item[];
  shipping_total?: number;
  tax_total?: number;
  total?: number;
}
