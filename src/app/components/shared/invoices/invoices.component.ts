import { Component, Inject, Input } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

import * as _ from 'lodash';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';

import { InvoiceService } from '../../../services/client-access/billing/billing.service';
import { GeneralFunctionsService } from '../../../services/general-functions/general-functions.service';
import { Invoice } from '../../../models/invoice';
import { PaymentMethod } from '../../../models/payment-method';

declare let require: (any);

@Component({
  selector: 'invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss'],
  providers: [InvoiceService, GeneralFunctionsService]
})
export class InvoicesComponent {
  @Input() adminMode = false;
  @Input() activeInvoiceId: number;
  @Input() targetType: string = 'job';
  @Input() targetId: number;

  public totalItems = 0;
  public currentPage = 1;
  public perPage = 5;
  private paginator = {
    totalItems: 100,
    currentPage: 1,
    perPage: 5,
  };
  private hasPages: boolean = false;
  private selectedCategoryId: number = 0;
  private jobInvoices: Array<any> = [];
  private jobContracts: Array<any> = [];
  private selectAllChecked: boolean = false;
  private itemsChecked: Array<any> = [];
  private isLoading: boolean = false;
  private checkTable: boolean = true;
  private tableAbleToDisplay: boolean = false;
  private activeInvoice: Invoice;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private invoiceService: InvoiceService,
    private generalFunctions: GeneralFunctionsService,
    private flash: FlashMessageService) {
  }

  ngOnInit() {
    this.getInvoices();
  }

  ngDoCheck() {
    if (this.checkTable) {
      this.setTableHeight();
      this.setTableWidth();
    }
  }

  ngOnDestroy() {
    let wrapper = document.getElementById('wrapper');
    if (wrapper) {
      wrapper.style.height = '100%';
    }
  }

  updateInvoicePaymentMethod(paymentMethodData: PaymentMethod) {
    let paymentMethodFields = ['merchant_account', 'collect_manually', 'pay_with_check', 'merchant_account_details'];
    let oldValues = _.pick(this.activeInvoice, paymentMethodFields);
    paymentMethodData['merchant_account_details'] = this.activeInvoice.merchant_account_details;
    if (_.isEqual(paymentMethodData, oldValues)) {
      return;
    }
    this.invoiceService.partialUpdate(this.activeInvoice.id, paymentMethodData).subscribe((invoice) => {
      let data = _.pick(invoice, paymentMethodFields);
      _.assign(this.activeInvoice, data);
      this.flash.success('Payment method has been updated');
    });
  }

  /**
   * Get invoices and display them in a list.
   */
  private getInvoices() {
    this.isLoading = true;
    this.tableAbleToDisplay = false;

      this.getInvoicesServiceMethod()
        .subscribe((invoices: Invoice[]) => {
          this.jobInvoices = invoices;
          this.isLoading = false;
          if (this.jobInvoices.length && this.activeInvoiceId) {
            this.activeInvoice = _.find(this.jobInvoices, {id: +this.activeInvoiceId});
          } else if (this.jobInvoices.length === 1) {
            this.activeInvoice = this.jobInvoices[0];
          }
        },
        err => {
          console.error(err);
          this.isLoading = false;
        }
      );
  }

  private getInvoicesServiceMethod() {
    if (this.targetType === 'job')
      return this.invoiceService.getInvoiceInfoByJob(this.targetId);

    return this.invoiceService.getInvoicesByContact(this.targetId);
  }

  /**
   * Function to set the width of the th element of the table.
   */
  private setTableWidth() {
    this.generalFunctions.setTableWidth(this.document);
  }

  /**
   * Function to set the height of the th element of the table.
   */
  private setTableHeight() {
    this.generalFunctions.setTableHeight(this.document, this.checkTable);
  }

  /**
   * Update the list when a change page event is emited by pagination component.
   *
   * @param {any} event [description]
   */
  private handlePageChange(e: any) {
    this.paginator.perPage = e.perPage;
    this.hasPages = (this.paginator.perPage !== 0 && this.paginator.totalItems > this.paginator.perPage);
  }

  /**
   * Handle subtab changes
   *
   * @param {string} status [new current status]
   */
  private selectedCategoryChanged(categoryId: number) {
    this.isLoading = true;
    this.selectedCategoryId = categoryId;
    this.itemsChecked = [];
    this.selectAllChecked = false;
    if (this.selectedCategoryId === 0) {
    } else if (this.selectedCategoryId === 1) {
      this.getInvoices();
    }
  }

  /**
   * Check all Invoices/Contracts
   */
  private checkAll() {
    this.selectAllChecked = !this.selectAllChecked;
    this.itemsChecked.splice(0);
    let activeList = this.selectedCategoryId === 0 ? this.jobContracts : this.jobInvoices;
    if (this.selectAllChecked && activeList) {
      for (let item of activeList) {
        this.checkItem(item);
      }
    }
  }

  /**
   * Check if an item is checked or not
   */
  private isChecked(item) {
    return (this.itemsChecked.indexOf(item.id) !== -1);
  }

  /**
   * Toogle the item selected status
   * @param {[Contact]}
   */
  private toggleCheck(item) {
    if (!this.isChecked(item)) {
      this.checkItem(item);
    } else {
      this.uncheckItem(item);
    }
  }

  /**
   * Check an item
   * @param {[type]}
   */
  private checkItem(item) {
    this.itemsChecked.push(item.id);
    let activeList = this.selectedCategoryId === 0 ? this.jobContracts : this.jobInvoices;
    if (this.itemsChecked.length === activeList.length) {
      this.selectAllChecked = true;
    } else {
      this.selectAllChecked = false;
    }
  }

  /**
   * Uncheck an item
   * @param {[type]}
   */
  private uncheckItem(item) {
    let i = this.itemsChecked.indexOf(item.id);
    this.itemsChecked.splice(i, 1);
    this.selectAllChecked = false;
  }
}
