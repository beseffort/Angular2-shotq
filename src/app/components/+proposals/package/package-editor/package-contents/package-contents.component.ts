import * as _ from 'lodash';
import {
  Component, Input, Output,
  OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { Item } from '../../../../../models/item';
import { ItemTemplate } from '../../../../../models/item-template';
import { PackageItem } from '../../../../../models/package-item';
import { ItemOptionGroup } from '../../../../../models/item-option-group';
import { ItemTemplateService } from '../../../../../services/product/item-template';


interface ContentItem {
  id?: number;
  item: Item;
  quantity: number;
  position?: number;
  option_groups?: ItemOptionGroup[];
  $isTemplate?: boolean;
}

@Component({
  selector: 'package-contents',
  templateUrl: './package-contents.component.html',
  styleUrls: ['./package-contents.component.scss'],
})
export class PackageContentsComponent implements OnChanges {
  @Input() contents: PackageItem[];
  @Output() contentsChanged = new EventEmitter();
  items: ContentItem[] = [];
  activeItemId: number = null;
  dragulaOptions = {
    modelItemModifier: (item) => {
      return {item: item, quantity: 1, $isTemplate: true};
    }
  };

  constructor(
    private dragulaService: DragulaService,
    private itemTemplateService: ItemTemplateService
  ) {
    dragulaService.dropModel.subscribe((args) => {
      if (this.contents.length !== this.items.length) {
        let itemTemplate = <ItemTemplate>this.items.find(i => i.$isTemplate).item;
        this.createItemFromItemTemplate(itemTemplate).subscribe((item) => {
          this.contentsChanged.emit(this.getContents());
        });
      } else {
        this.contentsChanged.emit(this.getContents());
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['contents']) {
      this.items = this.contents.map((item, index) => {
        return {
          id: item.id,
          item: item.item_data,
          quantity: item.quantity,
          option_groups: item.option_groups,
          position: index
        };
      });
    }
  }

  getContents(): PackageItem[] {
    return this.items.map((item, index) => {
      return {
        id: item.id,
        item: item.item.id,
        item_data: item.item,
        quantity: item.quantity,
        option_groups: item.option_groups,
        position: index
      };
    });
  }

  removeProduct(index: number) {
    this.items.splice(index, 1);
    this.contentsChanged.emit(this.getContents());
  }

  increaseProductUnit(product: ContentItem, e: MouseEvent): void {
    this.changeUnit(product, e, 1);
  }

  decreaseProductUnit(product: ContentItem, e: MouseEvent): void {
    if (product.quantity < 2) {
      return;
    }
    this.changeUnit(product, e, -1);
  }

  onChangeItem(product) {
    this.contentsChanged.emit(this.getContents());
  }

  createItemFromItemTemplate(packageTemplate: ItemTemplate) {
    return this.itemTemplateService.createItem(packageTemplate.id)
      .do((item: Item) => {
        let index = this.items.findIndex(i => i.$isTemplate && i.item.id === item.item_template);
        if (index !== -1) {
          this.items[index].item = item;
          delete this.items[index].$isTemplate;
          this.toggleItemOptions(item);
        }
      });
  }

  toggleItemOptions(item: Item) {
    if (this.activeItemId === item.id) {
      this.activeItemId = null;
    } else {
      if (item.option_groups.length === 0) {
        this.activeItemId = null;
      } else {
        this.activeItemId = item.id;
      }
    }
  }

  private changeUnit(product: ContentItem, e: MouseEvent, size: number) {
    e.preventDefault();
    e.stopPropagation();
    product.quantity += size;
    this.contentsChanged.emit(this.getContents());
  }

  private updateAddonsPrice(item: ContentItem) {
    item.item.addons_price = _.sum(
      item.item.option_groups
        .filter(g => !!g.selected)
        .map(g => parseFloat(g.selected_data.extra_price))
    );
    this.contentsChanged.emit(this.getContents());
  }
}
