import * as _ from 'lodash';
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DragulaService } from 'ng2-dragula/ng2-dragula';

import { Package } from '../../../../models/package';
import { ItemTemplate } from '../../../../models/item-template';
import { Item } from '../../../../models/item';
import { PackageItem } from '../../../../models/package-item';
import { Proposal } from '../../../../models/proposal';
import { ItemTemplateService } from '../../../../services/product/item-template';
import { ItemService } from '../../../../services/product/item';
import { PackageService } from '../../../../services/product/package';
import { JobService } from '../../../../services/job';
import { FlashMessageService } from '../../../../services/flash-message';
import { StateSaverService } from '../../../../services/state-saver';
import { PackageContentsComponent } from './package-contents';


@Component({
  selector: 'package-editor',
  templateUrl: './package-editor.component.html',
  styleUrls: ['./package-editor.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PackageEditorComponent implements OnInit {
  displayAddonsList: boolean = false;
  allItems: ItemTemplate[];
  package: Package = {
    account: 1,
    name: '',
    items: [],
    addons: [],
    cogs_total: 0,
    price: 0,
    profit_margin: 0
  };
  selectedIds: number[] = [];
  currentProposal: Proposal;
  toBackPath = ['../'];
  selectedItems: Item[] = [];
  @ViewChild(PackageContentsComponent) contentsComponent: PackageContentsComponent;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private location: Location,
              private dragulaService: DragulaService,
              private packageTemplateService: PackageService,
              private itemTemplateService: ItemTemplateService,
              private jobService: JobService,
              private flashMessageService: FlashMessageService,
              private stateSaverService: StateSaverService) {
  }

  ngOnInit() {
    this.initDragAndDrop();
    this.itemTemplateService.getList({status: 'active'}).subscribe((res: { results: ItemTemplate[], count: number }) => {
      this.allItems = res.results;
      this.route.params.subscribe((params) => {
        let jobId = +params['id'];
        this.jobService.getOrCreateProposal(jobId)
          .subscribe((proposal) => {
            this.currentProposal = proposal;
            this.package.proposal = this.currentProposal.id;
          });
        if (!params['packageid']) {
          return;
        }
        let id = +params['packageid'];
        this.toBackPath = ['../../'];
        this.packageTemplateService.get(id)
          .subscribe((data) => {
            this.package = data;
            if (this.currentProposal) {
              this.package.proposal = this.currentProposal.id;
            }
            this.displayAddonsList = this.package.addons.length > 0;
            this.recalculate();
          });
      });
      this.route
        .queryParams
        .subscribe((params) => {
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
    this.itemTemplateService.createItem(data.item.id).subscribe((item: Item) => {
      if (data.destination === 'package') {
        this.package.items = _.concat(this.package.items, {
          item: item.id,
          item_data: item,
          quantity: 1
        });
      } else {
        this.package.addons = _.concat(this.package.addons, item);
      }
      this.contentsComponent.toggleItemOptions(item);
      this.recalculate();
    });
  }

  onItemsChange(items: PackageItem[]) {
    this.package.items = items;
    this.recalculate();
  }

  onAddonsChange(items: Item[]) {
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
      i => parseFloat(i.item_data.price) + parseFloat(<string>i.item_data.addons_price) * i.quantity
    ));
    let costItemsPrice = _.sum(this.package.items.map(
      i => parseFloat(i.item_data.cost_of_goods_sold) * i.quantity
    ));
    let shippingCostItems = _.sum(this.package.items.map(
      i => parseFloat(i.item_data.shipping_cost) * i.quantity
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
      this.router.navigate(this.toBackPath, {relativeTo: this.route});
    });
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
          source === document.getElementById('packageItems');
      },
      copy: function (el, source) {
        return source === document.getElementById('newProducts');
      },
      accepts: function (el, target) {
        return el.parentElement === document.getElementById('newProducts') ||
          target === document.getElementById('packageItems');
      }
    });
    this.dragulaService.dropModel.subscribe((value) => {
      this.recalculate();
    });
  }

  private updateSelectedIds() {
    let itemsIds = this.package.items.map(i => i.item);
    this.selectedIds = _.concat(itemsIds, this.package.addons.map(i => i.id));
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
