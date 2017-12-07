import { Injectable } from '@angular/core';
import { PackageTemplate } from '../../../models/package-template';
import { ProductTemplateService } from '../product-template';

@Injectable()
export class PackageTemplateService extends ProductTemplateService<PackageTemplate> {
  baseUrl = 'product/packagetemplate';

  getList(params: any = {}) {
    return super.getList(params)
      .map(data => {
        data.results = data.results.filter(item => item.status !== 'deleted');
        return data;
      });
  }

  bulkAdjustStatus(data) {
    data.package_templates = data.templates;
    return super.bulkAdjustStatus(data);
  }
}
