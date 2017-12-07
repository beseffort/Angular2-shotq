import * as _ from 'lodash';
import {
  Component, OnInit, Input,
  Output, EventEmitter, OnChanges,
  SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ItemCategory } from '../../../../../models/item-category';
import { BaseItem } from '../../../../../models/base-item';
import { ItemCategoryService } from '../../../../../services/product/item-category';


@Component({
  selector: 'package-all-items',
  templateUrl: 'package-all-items.component.html'
})
export class PackageAllItems implements OnInit, OnChanges {
  @Input() addonsEnabled: boolean;
  @Input() allItems: BaseItem[];
  @Input() selectedIds: number[] = [];
  @Output() addingItem = new EventEmitter();
  categoryForm: FormGroup;
  items = [];
  categories: {value: number, label: string}[];

  constructor(
    private fb: FormBuilder,
    private itemCategoryService: ItemCategoryService
  ) { }

  ngOnInit() {
    this.itemCategoryService.getList().subscribe((categories) => {
      let categoriesList = categories.results.map((c) => {
        return {value: c.id, label: c.name};
      });
      categoriesList.unshift({value: null, label: 'All Categories'});
      this.categories = categoriesList;
      this.initCategoryForm();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['allItems'] && !changes['allItems'].previousValue && changes['allItems'].currentValue) {
      this.filterItemsByCategory(null);
    }
    if (this.categoryForm && this.allItems && changes['selectedIds']) {
      this.filterItemsByCategory(this.categoryForm.controls['category'].value);
    }
  }

  filterItemsByCategory(categoryId: number|null): void {
    let items;
    if (!categoryId) {
      items = _.clone(this.allItems);
    } else {
      items = this.allItems.filter(
        item => item.categories.indexOf(categoryId) !== -1
      );
    }
    this.items = items.filter((i) => this.selectedIds.indexOf(i.id) === -1);
  }

  onAddItem(item, destination: string) {
    this.addingItem.emit({item: item, destination: destination});
  }

  private initCategoryForm() {
    this.categoryForm = this.fb.group({
      category: null
    });
    this.categoryForm.controls['category'].valueChanges.subscribe(
      this.filterItemsByCategory.bind(this)
    );
  }
}
