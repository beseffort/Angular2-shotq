import * as _ from 'lodash';
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { DragulaService } from 'ng2-dragula/ng2-dragula';

import { PackageTemplate } from '../../../../models/package-template';
import { ItemTemplate } from '../../../../models/item-template';
import { PackageTemplateItem } from '../../../../models/package-template-item';
import { ItemTemplateService } from '../../../../services/product/item-template';
import { PackageTemplateService } from '../../../../services/product/package-template';
import { FlashMessageService } from '../../../../services/flash-message';
import { StateSaverService } from '../../../../services/state-saver';
import { PackageTemplateContentsComponent } from './package-template-contents';


@Component({
  selector: 'package-template-editor',
  templateUrl: './package-template-editor.component.html',
  styleUrls: ['./package-template-editor.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PackageTemplateEditorComponent implements OnInit {
  displayAddonsList: boolean = false;
  allTemplateItems: ItemTemplate[];
  package: PackageTemplate = {
    account: 1,
    name: '',
    items: [],
    addons: [],
    cogs_total: 0,
    price: 0,
    profit_margin: 0
  };
  selectedIds: number[] = [];
  nextUrl: string;
  @ViewChild(PackageTemplateContentsComponent) contentsComponent: PackageTemplateContentsComponent;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private location: Location,
              private dragulaService: DragulaService,
              private packageTemplateService: PackageTemplateService,
              private itemTemplateService: ItemTemplateService,
              private flashMessageService: FlashMessageService,
              private stateSaverService: StateSaverService) {
  }

  ngOnInit() {
    this.initDragAndDrop();
    this.itemTemplateService.getList({status: 'active'}).subscribe((res: { results: ItemTemplate[], count: number }) => {
      this.allTemplateItems = res.results;
      this.route.params.subscribe((params) => {
        if (!params['id']) {
          return;
        }
        let id = +params['id'];
        this.packageTemplateService.get(id)
          .subscribe((data) => {
            if (!this.package || this.package.id !== data.id) {
              this.assignPackage(data);
            }
          });
      });
      this.route
        .queryParams
        .subscribe((params) => {
          this.nextUrl = params['next'] || null;
          if (params['restorestate']) {
            let restoredStateData = this.stateSaverService.getSavedStateData(params['restorestate']);
            if (restoredStateData) {
              this.restoreState(restoredStateData);
            }
          }
        });
    });
    this.recalculate();
  }

  updateDescription(descriptionData) {
    _.assignIn(this.package, descriptionData);
  }

  addItem(data: { item: ItemTemplate, destination: string }) {
    if (data.destination === 'package') {
      let newItem = {
        id: this.contentsComponent.generateRandomId(),
        item_template: data.item.id,
        item_template_data: data.item,
        quantity: 1,
        addons_price: 0
      };
      this.package.items = _.concat(this.package.items, newItem);
      this.contentsComponent.activeItemId = newItem.id;
    } else {
      this.package.addons = _.concat(this.package.addons, data.item.id);
    }
    this.recalculate();
  }

  onItemsChange(items: PackageTemplateItem[]) {
    this.package.items = items;
    this.recalculate();
  }

  onAddonsChange(items: number[]) {
    this.package.addons = items;
    this.recalculate();
  }

  toggleAddons() {
    let toggle = () => {
      if (!this.displayAddonsList) {
        this.package.addons = [];
        this.recalculate();
      }
    };
    setTimeout(toggle, 0);
  }

  recalculate() {
    let itemsPrice = _.sum(this.package.items.map(
      i => (parseFloat(i.item_template_data.price) + parseFloat(<string>i.addons_price)) * i.quantity
    ));
    let costItemsPrice = _.sum(this.package.items.map(
      i => parseFloat(i.item_template_data.cost_of_goods_sold) * i.quantity
    ));
    let shippingCostItems = _.sum(this.package.items.map(
      i => parseFloat(i.item_template_data.shipping_cost) * i.quantity
    ));
    this.package.cogs_total = costItemsPrice;
    this.package.shipping_cost = shippingCostItems;
    if (!this.package.manual_price) {
      this.package.price = itemsPrice;
    }
    this.package.profit_margin = <number>this.package.price - (this.package.cogs_total + this.package.shipping_cost);
    this.updateSelectedIds();
  }

  save() {
    if (!this.package.name) {
      this.flashMessageService.error('Name is required field');
      return;
    }
    this.packageTemplateService.save(this.package).subscribe((packageTemplate) => {
      this.goBack();
    });
  }

  goToBack(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.goBack();
  }

  createNewItem() {
    let stateData = this.getStateData();
    let saveResult = this.stateSaverService.saveState(this.location.path(), stateData);
    this.router.navigate(['/pricing', 'items', 'add'], {queryParams: {next: saveResult.nextUrl}});
  }

  private initDragAndDrop() {
    const bag: any = this.dragulaService.find('package-items-bag');
    if (bag !== undefined) this.dragulaService.destroy('package-items-bag');
    this.dragulaService.setOptions('package-items-bag', {
      mirrorContainer: document.body,
      copySortSource: false,
      revertOnSpill: false,
      moves: function (el, source, handle, sibling) {
        return source === document.getElementById('newProducts') ||
          source === document.getElementById('packageTemplateItems');
      },
      copy: function (el, source) {
        return source === document.getElementById('newProducts');
      },
      accepts: function (el, target) {
        return el.parentElement === document.getElementById('newProducts') ||
          target === document.getElementById('packageTemplateItems');
      }
    });
    this.dragulaService.dropModel.subscribe((value) => {
      this.recalculate();
    });
  }

  private updateSelectedIds() {
    let itemsIds = this.package.items.map(i => i.item_template);
    this.selectedIds = _.concat(itemsIds, this.package.addons);
  }

  private goBack() {
    if (this.nextUrl) {
      this.router.navigateByUrl(this.nextUrl);
    } else {
      this.router.navigate(['/settings', 'products', 'packages']);
    }
  }

  private getStateData() {
    return {package: this.package};
  }

  private restoreState(stateData) {
    this.assignPackage(stateData.package);
  }

  private assignPackage(packageInstance) {
    this.package = packageInstance;
    this.displayAddonsList = this.package.addons.length > 0;
    this.recalculate();
  }

  private onTotalChange(value) {
    if (value === '') {
      this.package.manual_price = false;
    } else {
      this.package.price = value;
      this.package.manual_price = true;
    }
    this.recalculate();
  }

}
