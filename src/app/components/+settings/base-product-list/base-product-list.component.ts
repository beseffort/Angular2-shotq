import * as _ from 'lodash';
import { Component, OnInit, ViewEncapsulation, ViewChild, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Accordion } from 'ngx-accordion';

import { FlashMessageService } from '../../../services/flash-message';
import { RestClientService } from '../../../services/rest-client';
import { ProductTemplateService } from '../../../services/product/product-template';
import { ManageProductCategoriesComponent } from './manage-categories';
import { ProductSearchQueryParams } from './product-search-query.model';
import { ProductsAction } from './product-action.model';
import {
  FilteredCategory, addSpecialCategoriesAndFillFilters
} from './special-categories';
import { Modal, overlayConfigFactory, Overlay } from 'single-angular-modal';
import { ManageCategoriesWindowData } from './manage-categories/manage-categories.component';

@Component({
  selector: 'base-product-list',
  templateUrl: './base-product-list.component.html',
  styleUrls: ['./base-product-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BaseProductList<ModelClass, CategoryClass extends FilteredCategory> implements OnInit {
  product: string;
  defaultSearchParams: ProductSearchQueryParams = {
    page: 1,
    page_size: 10,
    ordering: 'name',
    status: 'active'
  };
  searchParams: ProductSearchQueryParams = _.clone(this.defaultSearchParams);
  searchKeys: string[] = _.keys(this.defaultSearchParams);
  products: ModelClass[];
  productsCount: number;
  categories: CategoryClass[] = [];
  realCategories: CategoryClass[] = [];
  openedCategoryIndex: number = 0;
  baseProductUrl: string;
  isLoading: boolean = false;

  categoryItemsCountFieldName: string;

  private alertify = require('../../../assets/theme/assets/vendor/alertify-js/alertify.js');

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductTemplateService<ModelClass>,
    private categoriesService: RestClientService<CategoryClass>,
    private flash: FlashMessageService,
    public modal: Modal,
    overlay: Overlay,
    vcRef: ViewContainerRef,
  ) {
    overlay.defaultViewContainer = vcRef;
  }

  ngOnInit() {
    this.alertify.theme('bootstrap-shootq');
    this.alertify.okBtn('OK');

    this.loadProducts();
    this.loadCategories();
    this.initBaseProductUrl();
  }

  extractProducts(response) {
    this.products = response.results;
    this.productsCount = response.count;
  }

  openCategory(category: CategoryClass) {
    this.openedCategoryIndex = this.categories.findIndex(c => c.id === category.id);
    let filterParams = _.assignIn({
      category: null,
      status: null,
      categories_count: null
    }, this.defaultSearchParams, category.filter_params);
    this.updateSearchParams(filterParams);
  }

  doProductsActions(actionData: ProductsAction) {
    switch (actionData.action) {
      case 'copy':
        // Copying multiple objects is not supported
        this.copyProduct(actionData.products[0]);
        break;
      case 'archive':
        this.bulkAdjustStatus(actionData.products, 'archived');
        break;
      case 'continue':
        this.bulkAdjustStatus(actionData.products, 'active');
        break;
      case 'delete':
        this.bulkAdjustStatus(actionData.products, 'deleted');
        break;
      default:
        break;
    }
  }

  openManageCategoriesModal() {
    this.modal
      .open(ManageProductCategoriesComponent, overlayConfigFactory({
        categoriesService: this.categoriesService
      }, ManageCategoriesWindowData))
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            this.loadCategories();
          })
          .catch(() => {
          });
      });
  }

  deleteCategory(event: {category: CategoryClass, index: number}) {
    this.alertify.confirm('Are you sure that you want to delete this category?', () => {
      if (!event.category.id) {
        this.realCategories.splice(event.index);
        return;
      }
      this.categoriesService.delete(event.category.id).subscribe(() => {
        this.loadCategories();
      });
    });
  }

  private updateSearchParams(params) {
    if (_.isEmpty(params)) {
      return;
    }
    let searchIsChanged = _.has(params, 'search') && this.searchParams.search !== params.search;
    this.searchParams = _.assignIn(this.searchParams, params);
    if (searchIsChanged) {
      this.loadCategories();
    }
    this.loadProducts();
  }

  private loadProducts() {
    this.products = [];
    this.productsCount = 0;
    this.isLoading = true;
    this.productService.getList(this.searchParams)
      .subscribe(
        this.extractProducts.bind(this),
        () => {},
        () => { this.isLoading = false; }
      );
  }

  private loadCategories() {
    let searchValue = this.searchParams.search;
    this.categoriesService.getList({page_size: 1000, product_name: searchValue})
      .map((res: {results: CategoryClass[], count: number}) => {
        return addSpecialCategoriesAndFillFilters(res, this.categoryItemsCountFieldName);
      })
      .subscribe((categories) => {
        this.categories = categories;
        this.realCategories = _.filter(this.categories, c => !c.is_fake);
      });
  }

  private copyProduct(productId) {
    this.productService.clone(productId).subscribe((res: {template_id: number}) => {
      this.flash.success(`The item has been copied.`);
      let objPath = this.product === 'item-template' ? 'items' : 'packages';
      this.router.navigate(['/pricing', objPath, 'edit', res.template_id]);
    });
  }

  private bulkAdjustStatus(products: number[], status: string) {
    let data = {status: status, templates: products};
    this.productService.bulkAdjustStatus(data).subscribe((res) => {
      this.flash.success(`The items have been ${status}.`);
      this.loadProducts();
      this.loadCategories();
    });
  }

  private initBaseProductUrl() {
    if (this.product === 'item-template') {
      this.baseProductUrl = '/pricing/items';
    } else {
      this.baseProductUrl = '/proposals/package-template';
    }
  }
}
