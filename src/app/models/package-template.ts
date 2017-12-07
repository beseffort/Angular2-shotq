import { PackageTemplateItem } from './package-template-item';
import { BasePackage } from './base-package';


export class PackageTemplate extends BasePackage {
  items: PackageTemplateItem[];
  $openOnEdit?: boolean;
  package_count?: number;
  addons: number[];
}

export const statusArchived = 'archived';
