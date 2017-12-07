import { Component, ViewEncapsulation, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BreadcrumbService } from '../../shared/breadcrumb/components/breadcrumb.service';
import { FlashMessageService } from '../../../services/flash-message';
import { BaseProductList } from '../base-product-list';
import { ItemTemplate } from '../../../models/item-template';
import { ItemCategory } from '../../../models/item-category';
import { ItemTemplateService } from '../../../services/product/item-template';
import { ItemCategoryService } from '../../../services/product/item-category';
import { Modal, Overlay } from 'single-angular-modal';


@Component({
  selector: 'product-items-list',
  templateUrl: '../base-product-list/base-product-list.component.html',
  styleUrls: ['../base-product-list/base-product-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProductItemsListComponent extends BaseProductList<ItemTemplate, ItemCategory> {
  product: string = 'item-template';
  categoryItemsCountFieldName: string = 'item_template_count';

  constructor(
    router: Router,
    route: ActivatedRoute,
    productService: ItemTemplateService,
    categoryService: ItemCategoryService,
    flash: FlashMessageService,
    breadcrumbService: BreadcrumbService,
    modal: Modal,
    overlay: Overlay,
    vcRef: ViewContainerRef,
  ) {
    super(router, route, productService, categoryService, flash, modal, overlay, vcRef);
    breadcrumbService.addFriendlyNameForRoute('/settings/products/items', 'Items');
  }
}
