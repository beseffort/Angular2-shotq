import { Component, Input, Output, EventEmitter, OnInit, AfterViewChecked } from '@angular/core';
import { MdUniqueSelectionDispatcher }  from '@angular2-material/core';
/* Services */
import { FlashMessageService }          from '../../../../services/flash-message';
import { PackageTemplateService }       from '../../../../services/product/package-template';
/* Models */
import { PackageTemplate }                from '../../../../models/package-template';

declare let require: (any);

@Component({
    selector: 'adjust-package-price',
    templateUrl: './adjust-package-price.component.html',
    styleUrls : ['./adjust-package-price.component.scss'],
    providers: [MdUniqueSelectionDispatcher, PackageTemplateService]
})
export class AdjustPackagePriceComponent {
  @Input() data;
  @Output() closeModal = new EventEmitter();

  public _ = require('../../../../../../node_modules/lodash');

  private componentRef;
  private selectedOption = null;
  private showAmountInput = false;
  private editable = [];
  private inputId = null;
  private value = null;
  private isLoading = false;
  private originalPrices = [];
  private profitMargin = [];
  private percentProfitMargin = [];

  constructor(
    private flash: FlashMessageService,
    private packageTemplateService: PackageTemplateService
  ) {}

  ngOnInit() {
    this.value = null;
    this.selectedOption = null;

    if (this.data !== undefined) {
      for (let i = 0; i < this.data.length; i++) {
        this.editable[i] = false;
      }
      this.setOriginalPrices();
      this.calculateProfitMargin();
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
   * Calculate profit margin for each package
   *
   */
  public calculateProfitMargin() {
    this.profitMargin = [];
    this.percentProfitMargin = [];
    for (let i = 0; i < this.data.length; i++) {
      let price = parseFloat(this.data[i]['price']);
      let cogs = parseFloat(this.data[i]['cogs_total']);
      let profitMargin = 0;
      let percentProfitMargin = 0;

      if (!isNaN(price) && !isNaN(cogs)) {
        profitMargin = price - cogs;
      }

      if (price !== 0 && !isNaN(price)) {
        percentProfitMargin = (profitMargin / price);
      }

      this.profitMargin.push(profitMargin);
      this.percentProfitMargin.push(percentProfitMargin);
    }
  }

  /**
   * Adjust package prices
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

    this.calculateProfitMargin();
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
   */
  public editCell(row: number) {
    this.editable[row] = true;
    this.inputId = 'item-price-' + row.toString();
  }

  /**
   * Hides the input when it lost the focus
   * @param {number} row [index of edited row]
   */
  public endEditing(row: number) {
    this.editable[row] = false;
    this.inputId = null;

    this.calculateProfitMargin();
    this.updatePackage(this.data[row], row);
  }

  /**
   * Update package after lost focus
   *
   */
  public updatePackage(pack: any, index: number) {
    this.isLoading = true;
    let response = null;
    let packData = pack as PackageTemplate;

    let packTemp = {
      'id': packData.id,
      'price': packData.price,
      'account': packData.account,
      'name': packData.name,
      'categories': packData.categories
    };

    this.packageTemplateService.save(packTemp)
      .subscribe(updateData => {
          response = updateData;
          this.flash.success('The package price have been updated.');
          this.componentRef.loadCategoriesAndItems('packages');
          this.originalPrices[index] = packTemp.price;
      },
      err => {
        this.flash.error('An error has occurred updating the package, please try again later.');
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
   */
  public onKeyPress(e, row) {
    if (e.keyCode === 13) {
      this.endEditing(row);
    }
  }

  /**
   * Close modal saving modifications
   *
   */
  public save() {
    let response = null;

    if (!this.selectedOption || !this.value) {
      this.flash.error('Please, insert a percentage or amount to adjust package prices');
      return;
    }

    this.isLoading = true;

    let ids = [];
    for (let pack of this.data) {
      ids.push(pack.id);
    }

    let data = {
      'method': this.selectedOption,
      'value': this.value,
      'package_templates': ids
    };
    this.packageTemplateService.bulkAdjustPrice(data)
      .subscribe(updateData => {
            response = updateData;
            this.value = null;
            this.selectedOption = null;
            this.componentRef.loadCategoriesAndItems('packages');
            this.setOriginalPrices();
            this.flash.success('The prices have been updated.');
            this.closeModal.emit({action: 'close-modal'});
        },
        err => {
          this.flash.error('An error has occurred updating package prices, please try again later.');
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
