import * as _ from 'lodash';
import {
  Component, Input, Output,
  OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { BaseItem } from '../../../../../models/base-item';
import { Item } from '../../../../../models/item';
import { ItemTemplate } from '../../../../../models/item-template';
import { ItemTemplateService } from '../../../../../services/product/item-template';
import { ItemService } from '../../../../../services/product/item';


@Component({
  selector: 'package-addons',
  templateUrl: './package-addons.component.html'
})
export class PackageAddonsComponent implements OnChanges {
  @Input() contents: Item[];
  @Output() contentsChanged: EventEmitter<Item[]> = new EventEmitter<Item[]>();
  items: BaseItem[] = [];
  dragulaOptions = {
    modelItemModifier: (item) => {
      return _.assignIn(item, {$isTemplate: true});
    }
  };

  constructor(
    private dragulaService: DragulaService,
    private itemTemplateService: ItemTemplateService,
    private itemService: ItemService
  ) {
    dragulaService.dropModel.subscribe((args) => {
      if (this.contents.length !== this.items.length) {
        let itemTemplate = <ItemTemplate>this.items.find(i => i.$isTemplate);
        this.createItemFromItemTemplate(itemTemplate).subscribe((item) => {
          this.contentsChanged.emit(this.getContents());
        });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['contents']) {
      this.items = _.cloneDeep(this.contents);
    }
  }

  getContents(): Item[] {
    return this.items;
  }

  removeProduct(index: number) {
    this.items.splice(index, 1);
    this.contentsChanged.emit(this.getContents());
  }

  createItemFromItemTemplate(packageTemplate: ItemTemplate) {
    return this.itemTemplateService.createItem(packageTemplate.id)
      .do((item: Item) => {
        let index = this.items.findIndex(i => i.$isTemplate && i.id === item.item_template);
        if (index !== -1) {
          this.items[index] = item;
        }
      });
  }
}
