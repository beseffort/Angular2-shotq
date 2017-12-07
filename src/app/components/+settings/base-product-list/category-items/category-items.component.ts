import * as _ from 'lodash';
import {
  Component, OnInit, OnChanges, SimpleChanges, Input,
  Output, EventEmitter, ViewChild
} from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import { BsDropdownDirective } from 'ngx-bootstrap/dropdown';

import { FlashMessageService } from '../../../../services/flash-message';
import { PRODUCT_CONFIRMATION_DATA } from './modal-dialogs-data';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { ProductSearchQueryParams } from '../product-search-query.model';
import { FilteredCategory } from '../special-categories';
import { ProductsAction } from '../product-action.model';

@Component({
  selector: 'category-items',
  templateUrl: './category-items.component.html',
  styleUrls: ['./category-items.component.scss']
})
export class CategoryItemsComponent implements OnInit, OnChanges {
  @ViewChild('archiveModal') public archiveModal: ConfirmDialogComponent;
  @ViewChild('continueModal') public continueModal: ConfirmDialogComponent;
  @ViewChild('deleteModal') public deleteModal: ConfirmDialogComponent;
  selectedProductIds: number[] = [];
  currentPage: number;
  rowsForm: FormGroup;
  pageSizeChoices: {value: number, label: string}[] = [
    {value: 5, label: '5'},
    {value: 10, label: '10'},
    {value: 50, label: '50'},
    {value: 100, label: '100'},
    {value: 150, label: '150'}
  ];
  @Input() realCategories: FilteredCategory[] = [];
  @Input() baseProductUrl: string;
  @Input() items: {id: number, status: string}[];
  @Input() itemsCount: number;
  @Input() searchParams: ProductSearchQueryParams;
  @Input() category: FilteredCategory;
  @Input() product: string;
  @Input() allCategories: FilteredCategory[] = [];
  @Output() updateSearchParams: EventEmitter<Object> = new EventEmitter<Object>();
  @Output() doProductsAction: EventEmitter<ProductsAction> = new EventEmitter<ProductsAction>();

  constructor(
    private fb: FormBuilder,
    private flash: FlashMessageService
  ) { }

  ngOnInit() {
    this.rowsForm = this.fb.group({
      page_size: [this.searchParams.page_size]
    });
    this.rowsForm.valueChanges.subscribe((changes) => {
      this.updateSearchParams.emit(changes);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['searchParams'] && this.currentPage !== this.searchParams.page) {
      this.currentPage = this.searchParams.page;
      this.resetSelectedProductIds();
    }
    if (changes['category']) {
      this.resetSelectedProductIds();
    }
  }

  pageChanged(pageChanges: {page: number, itemsPerPage: number}) {
    this.updateSearchParams.emit({page: pageChanges.page});
    this.resetSelectedProductIds();
  }

  changeSortBy() {
    let ordering;
    if (this.searchParams.ordering === 'name') {
      ordering = '-name';
    } else {
      ordering = 'name';
    }
    this.updateSearchParams.emit({ordering: ordering});
  }

  showConfirmation(action: string, products: number[], dropdown?: BsDropdownDirective) {
    if (dropdown) {
      dropdown.hide();
    }
    if (action === 'delete' && this.getOrderedProducts(products).length === 0) {
      this.flash.error('The item(s) cannot be deleted because they are ordered.');
      return;
    }
    let modalDialog = this[`${action}Modal`];
    _.assign(modalDialog, PRODUCT_CONFIRMATION_DATA[action]);
    modalDialog.data = {action: action, products: products};
    modalDialog.show();
  }

  doAction(actionData: {action: string, products: number[]}, dropdown?: BsDropdownDirective) {
    if (dropdown) {
      dropdown.hide();
    }
    this.doProductsAction.emit({
      action: actionData.action,
      products: actionData.products
    });
  }

  toggleSelectedAll() {
    if (this.selectedProductIds.length === this.items.length) {
      this.resetSelectedProductIds();
    } else {
      this.selectedProductIds = _.map(this.items, i => i.id);
    }
  }

  toggleCheckItem(item) {
    if (this.selectedProductIds.indexOf(item.id) === -1) {
      this.selectedProductIds.push(item.id);
    } else {
      this.selectedProductIds = _.without(this.selectedProductIds, item.id);
    }
  }

  private resetSelectedProductIds() {
    this.selectedProductIds = [];
  }

  private getOrderedProducts(productIds: number[]) {
    let orderedField = this.product === 'item-template' ? 'item_count' : 'package_count';
    return _.filter(
      this.items,
      i => productIds.indexOf(i.id) !== -1 && i[orderedField] === 0);
  }

}
