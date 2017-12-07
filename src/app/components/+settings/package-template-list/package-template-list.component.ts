import { Component, ViewEncapsulation, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { FlashMessageService } from '../../../services/flash-message';
import { BaseProductList } from '../base-product-list';
import { PackageTemplate } from '../../../models/package-template';
import { PackageCategory } from '../../../models/package-category';
import { PackageTemplateService } from '../../../services/product/package-template';
import { PackageCategoryService } from '../../../services/product/package-category';
import { Modal, Overlay } from 'single-angular-modal';


@Component({
  selector: 'package-templates-list',
  templateUrl: '../base-product-list/base-product-list.component.html',
  styleUrls: ['../base-product-list/base-product-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PackageTemplateListComponent extends BaseProductList<PackageTemplate, PackageCategory> {
  product: string = 'package-template';
  categoryItemsCountFieldName: string = 'package_template_count';

  constructor(
    router: Router,
    route: ActivatedRoute,
    productService: PackageTemplateService,
    categoryService: PackageCategoryService,
    flash: FlashMessageService,
    modal: Modal,
    overlay: Overlay,
    vcRef: ViewContainerRef,
  ) {
    super(router, route, productService, categoryService, flash, modal, overlay, vcRef);
  }
}
