import { Component, Input, Output, EventEmitter, OnInit, AfterViewChecked } from '@angular/core';
import { MdUniqueSelectionDispatcher } from '@angular2-material/core';
import { Observable }                  from 'rxjs/Observable';
/* Services */
import { FlashMessageService }         from '../../../../services/flash-message';
import { ItemTemplateService }         from '../../../../services/product/item-template/item-template.service';
/* Models */
import { ItemTemplate }                from '../../../../models/item-template';
import { Item }                        from '../../../../models/item';

import 'rxjs/Rx';

declare let require: (any);

@Component({
 selector: 'adjust-item-price',
 templateUrl: './adjust-item-price.component.html',
 styleUrls: ['./adjust-item-price.component.scss'],
 providers: [MdUniqueSelectionDispatcher, ItemTemplateService]
})
export class AdjustItemPriceComponent {
  @Input() data;
  @Output() closeModal = new EventEmitter();

  public _ = require('../../../../../../node_modules/lodash');

  private componentRef;
  private maintainProfit = false;
  private selectedOption = null;
  private editableRow0 = [];
  private editableRow1 = [];
  private editableRow2 = [];
  private inputId = null;
  private value = null;
  private isLoading = false;
  private originalPrices = [];

  constructor(
    private flash: FlashMessageService,
    private itemTemplateService: ItemTemplateService
  ) {}

  ngOnInit() {
    this.value = null;
    this.maintainProfit = false;
    this.selectedOption = null;

    if (this.data !== undefined) {
      for (let i = 0; i < this.data.length; i++) {
        this.editableRow0[i] = false;
        this.editableRow1[i] = false;
        this.editableRow2[i] = false;
      }
      this.setOriginalPrices();
    } else {
      console.error('data is undefined');
    }
  }

  ngAfterViewChecked() {
    if (this.inputId) {
      let input = document.getElementById(this.inputId);
      input.focus();
    }
  }

  /**
   * Set parent component ref
   * @param {[type]} ref [reference od parent component object]
   */
  public setComponentRef(ref) {
    this.componentRef = ref;
  }

  /**
   * Set static original prices
   *
   */
  public setOriginalPrices() {
    this.originalPrices = [];
    for (let i = 0; i < this.data.length; i++) {
      let aux_price = this._.cloneDeep(this.data[i]['price']);
      this.originalPrices.push(aux_price);
    }
  }

  /**
   * Adjust items prices
   *
   */
  public adjustPrices() {
    this.resetPrices();
    if (this.selectedOption === 'percent') {
      // check if there is a percentage seted, else show initial price
      if (this.value) {
        for (let i = 0; i < this.data.length; i++) {
          let price = parseFloat(this.data[i]['price']);
          let percentage = (parseFloat(this.value) / 100) + 1;
          this.data[i]['price'] = (price * percentage).toFixed(2);
        }
      } else {
        this.resetPrices();
      }
    } else if (this.selectedOption === 'fixed') {
      // check if there is an amount seted, else show initial price
      if (this.value) {
        for (let i = 0; i < this.data.length; i++) {
          let price = parseFloat(this.data[i]['price']);
          let amount = parseFloat(this.value);
          this.data[i]['price'] = (price + amount).toFixed(2);
        }
      } else {
        this.resetPrices();
      }
    }
  }

  /**
   * Reset prices to their initial values
   *
   */
  public resetPrices() {
    for (let i = 0; i < this.data.length; i++) {
      this.data[i]['price'] = this.originalPrices[i];
    }
  }

  /**
   * Reset values when radio button clicked
   *
   */
  public resetAdjustValues() {
    this.value = null;
    this.resetPrices();
  }

  /**
   * Shows the input to edit the cell content
   * @param {number} row [index of selected row for edit]
   * @param {number} col [index of selected col for edit]
   * @param {string} col_name [name of selected col for edit]
   */
  public editCell(row: number, col: number, col_name: string) {
    switch (col) {
      case 0:
        this.editableRow0[row] = true;
        break;
      case 1:
        this.editableRow1[row] = true;
        break;
      case 2:
        this.editableRow2[row] = true;
        break;
      default:
        break;
    }
    this.inputId = 'item-' + col_name + '-' + row.toString();
  }

  /**
   * Hides the input when it lost the focus
   * @param {number} row [index of selected row for edit]
   * @param {number} col [index of selected col for edit]
   */
  public endEditing(row: number, col: number) {
    this.inputId = null;
    switch (col) {
      case 0:
        this.editableRow0[row] = false;
        break;
      case 1:
        this.editableRow1[row] = false;
        break;
      case 2:
        this.editableRow2[row] = false;
        break;
      default:
        break;
    }

    this.updateItem(this.data[row], row);
  }

  /**
   * Update item after lost focus
   *
   */
  public updateItem(item, index) {
    this.isLoading = true;
    let response = null;
    let itemData = item as ItemTemplate;

    let itemTemp = {
      'id': itemData.id,
      'price': itemData.price,
      'cost_of_goods_sold': itemData.cost_of_goods_sold,
      'shipping_cost': itemData.shipping_cost,
      'update_package_price': this.maintainProfit
    };

    this.itemTemplateService.save(itemTemp)
      .subscribe(updateData => {
          response = updateData;
          this.flash.success('The item price have been updated.');
          this.componentRef.loadCategoriesAndItems(undefined);
          this.originalPrices[index] = itemTemp.price;
      },
      err => {
        this.flash.error('An error has occurred updating the item, please try again later.');
        console.error(err);
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  /**
   * Hides the input when enter is pressed
   * @param {event} e
   * @param {number} row [index of selected row]
   * @param {number} row [index of selected col]
   */
  public onKeyPress(e, row, col) {
    if (e.keyCode === 13) {
      this.endEditing(row, col);
    }
  }

  /**
   * Close modal saving modifications
   *
   */
  public save() {
    let response = null;

    if (!this.selectedOption || !this.value) {
      this.flash.error('Please, insert a percentage or amount to adjust item prices');
      return;
    }

    this.isLoading = true;

    let ids = [];
    for (let item of this.data) {
      ids.push(item.id);
    }

    let data = {
      'method': this.selectedOption,
      'value': this.value,
      'item_templates': ids
    };
    this.itemTemplateService.bulkAdjustPrice(data)
      .subscribe(updateData => {
            response = updateData;
            this.value = null;
            this.maintainProfit = false;
            this.selectedOption = null;
            this.componentRef.loadCategoriesAndItems(undefined);
            this.setOriginalPrices();
            this.flash.success('The prices have been updated.');
            this.closeModal.emit({action: 'close-modal'});
        },
        err => {
          this.flash.error('An error has occurred updating items prices, please try again later.');
          console.error(err);
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  /**
   * Close modal without saving modifications
   *
   */
  public cancel() {
    this.closeModal.emit({action: 'close-modal'});
  }
}
