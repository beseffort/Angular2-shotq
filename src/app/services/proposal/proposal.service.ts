///<reference path="../../models/item.ts"/>
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/Rx';
/* Services */
import { ApiService } from '../api';
/* Models */
import { Proposal } from '../../models/proposal';
import { PackageTemplate } from '../../models/package-template';
import { RestClientService } from '../rest-client/rest-client.service';
import { Observable } from 'rxjs';
import { ProposalSettingTemplate } from '../../models/proposal-setting-template';
import { Item } from '../../models/item';
import { PackageItem } from '../../models/package-item';
import { Discount } from '../../models/discount.model';
import { Tax } from '../../models/tax.model';
import { Worker } from '../../models/worker';
import { BookingOverview } from '../../models/proposal-payment-overview.model';

import {
  AMOUNT_CHOICE_FIXED, AMOUNT_CHOICE_PERCENTAGE_RATE, APPLY_RULE_AFTER_TAXES,
  APPLY_RULE_BEFORE_TAXES, FINAL_SUBTOTAL, RETAIL_PRICE
} from '../../models/discount-template.model';
import { and } from '@angular/router/src/utils/collection';
import { Package } from '../../models/package';

declare let require: (any);

@Injectable()
export class ProposalService extends RestClientService<Proposal> {
  baseUrl = 'booking/proposal';

  public settingsChanged = new Subject<any>();

  public static newObject(data?: object): Proposal {
    return Object.assign(new Proposal(), data || {});
  }

  constructor(apiService: ApiService) {
    super(apiService);
  }

  public addPackage(proposal: Proposal, packageTemplate: PackageTemplate) {
    return this.itemPost(proposal.id, 'add_package', {id: packageTemplate.id});
  }

  public send(id: number) {
    return this.itemPost(id, 'send');
  }

  public createSettings(proposalId: number, name: string): Observable<ProposalSettingTemplate> {
    return this.itemPost(proposalId, 'create_settings', {name: name});
  }

  public applySettings(proposalId: number, settingsId: number) {
    return this.itemPost(proposalId, 'apply_settings', {proposal_settings: settingsId});
  }

  public validatePaymentSchedule(proposalId: number, scheduleData) {
    return this.itemPost(proposalId, 'validate_payment_schedule', scheduleData);
  }

  public applyDiscountsAndtaxes(items: Item[], discounts: Discount[], taxes: Tax[], manual_price?: number) {
    manual_price = manual_price ? manual_price : null;
    let finalTaxAmount = 0;
    let fixedAmountDiscountSum = discounts
      .filter(discount => discount.amount_by === AMOUNT_CHOICE_FIXED)
      .map(discount => parseInt(<string>discount.total_amount, 10))
      .reduce((s, t) => s + t, 0);
    let percentageDiscountSum = 0;

    let appliedDiscounts = discounts
      .filter(discount => discount.amount_by === AMOUNT_CHOICE_PERCENTAGE_RATE);

    let discountsBeforeTaxes = appliedDiscounts
      .filter(discount => discount.apply_rule === APPLY_RULE_BEFORE_TAXES);

    let discountsAfterTaxes = appliedDiscounts
      .filter(discount => discount.apply_rule === APPLY_RULE_AFTER_TAXES);

    let applyDiscountsToManual = (discounts_) => {
      discounts_
        .filter(disc => disc.calculate_settings === FINAL_SUBTOTAL)
        .forEach(disc => {
          let discAmount = manual_price * (parseFloat(<string>disc.rate) / 100);
          discAmount = Math.round(discAmount * 100) / 100;
          percentageDiscountSum += discAmount;
          manual_price -= discAmount;
        });
    };

    items.map(item => item.final_price = item.total_price);
    taxes
      .filter(tax => tax.amount_by === AMOUNT_CHOICE_PERCENTAGE_RATE)
      .map(tax => tax.final_tax = 0);

    percentageDiscountSum += items
      .map(item => this.applyDiscountsToItem(item, discountsBeforeTaxes))
      .reduce((s, d) => s + d, 0);

    if (manual_price) {
      applyDiscountsToManual(discountsBeforeTaxes);
    }

    items
      .map(item => this.applyTaxesToItem(item, taxes));

    if (manual_price) {
      let initialManualPrice = manual_price;
      // Apply tax to addon's shipping
      taxes
        .filter(tax => tax.amount_by === AMOUNT_CHOICE_PERCENTAGE_RATE && tax.calculate_settings === FINAL_SUBTOTAL)
        .forEach(tax => {
          let taxRates = [parseFloat(<string>tax.rate) / 100].concat(
            tax.additional_rates.map(r => parseFloat(String(r)) / 100)
          );
          taxRates.forEach(taxRate => {
            let taxAmount = initialManualPrice * taxRate;
            taxAmount = Math.round(taxAmount * 100) / 100;
            finalTaxAmount += taxAmount;
            manual_price += taxAmount;
          });
        });
    }

    percentageDiscountSum += items
      .map(item => this.applyDiscountsToItem(item, discountsAfterTaxes))
      .reduce((s, d) => s + d, 0);

    if (manual_price) {
      applyDiscountsToManual(discountsAfterTaxes);
    }

    finalTaxAmount += taxes
      .reduce((s, t) => {
        return s + parseFloat(<string>t.final_tax);
      }, 0);

    return {
      discount: fixedAmountDiscountSum + percentageDiscountSum,
      tax: finalTaxAmount
    };
  }

  generateProposalPaymentOverview(proposal: Proposal, discounts: Discount[], taxes: Tax[]): BookingOverview {
    let overview: BookingOverview = {
      packagePrice: 0,
      selectedAddons: <Item[]>[],
      discounts: 0,
      shipping: 0,
      tax: 0,
      totalPrice: 0,
      subtotal: 0
    };
    let packageAddons = this.getApprovedAddons(proposal.approved_package_data.addons);
    let packageItems = this.getItemsWithQuantity(proposal.approved_package_data.items);

    let itemsAndAddons = [
      ...packageAddons,
      ...(proposal.approved_package_data.manual_price ? [] : packageItems)
    ];
    let calculations = this.applyDiscountsAndtaxes(
      itemsAndAddons,
      discounts,
      taxes,
      proposal.approved_package_data.manual_price ? parseFloat(<string>proposal.approved_package_data.price) : null
    );

    overview.discounts = calculations.discount;
    overview.tax = calculations.tax;

    // Calculate overview
    overview.selectedAddons = packageAddons;

    overview.packagePrice = parseFloat(<string>proposal.approved_package_data.price);

    overview.shipping = [
      ...packageAddons,
      ...packageItems
    ]
      .map(addon => parseFloat(addon.shipping_cost) * addon.quantity)
      .reduce((s, p) => s + p, 0);

    let itemsAndAddonsPrice = itemsAndAddons
      .map(addon => parseFloat(<string>addon.total_price) * addon.quantity)
      .reduce((s, p) => s + p, 0);

    if (proposal.approved_package_data.manual_price) {
      itemsAndAddonsPrice += parseFloat(<string>proposal.approved_package_data.price);
    }

    overview.subtotal = Math.max(0, [
      itemsAndAddonsPrice,
      -overview.discounts].reduce((s, p) => s + p, 0));
    overview.totalPrice = Math.max(0, [
      itemsAndAddonsPrice,
      overview.shipping,
      -overview.discounts,
      overview.tax].reduce((s, p) => s + p, 0));

    overview.totalPrice = Math.round(overview.totalPrice * 100) / 100;
    return overview;
  }

  applyDiscountsToItem(item: Item, discounts: Discount[]) {
    return discounts
      .filter((discount: Discount) => discount.calculate_settings === FINAL_SUBTOTAL ||
        discount.calculate_settings === RETAIL_PRICE &&
        discount.calculate_against.toLowerCase().includes(item.item_type.toLowerCase())
      )
      .map(discount => {
        let disc = parseFloat(<string>item.final_price) * (parseFloat(<string>discount.rate) / 100);
        disc = Math.round(disc * 100) / 100;
        item.final_price = parseFloat(<string>item.final_price) - disc;
        return disc * item.quantity;
      }).reduce((s, d) => s + d, 0);
  }

  getWorkers(proposalId): Observable<Worker[]> {
    return this.itemGet(proposalId, 'workers');
  }

  private getApprovedAddons(addons: Item[]) {
    return addons.filter(addon => addon.approved);
  }

  private getItemsWithQuantity(items: PackageItem[]) {
    return items.map(item => {
      item.item_data.quantity = item.quantity;
      return item.item_data;
    });
  }

  private applyTaxesToItem(item: Item, taxes: Tax[]) {
    let initialItemPrice = parseFloat(<string>item.final_price);

    return taxes
      .filter(tax => tax.amount_by === AMOUNT_CHOICE_PERCENTAGE_RATE)
      .forEach(tax => {
        let applyTaxToPrice = (
          tax.calculate_settings === FINAL_SUBTOTAL
          || tax.calculate_settings === RETAIL_PRICE
          && tax.calculate_against.toLowerCase().includes(item.item_type.toLowerCase())
        );
        let taxRates = [parseFloat(<string>tax.rate) / 100].concat(
          tax.additional_rates.map(r => parseFloat(String(r)) / 100)
        );

        taxRates.forEach(taxRate => {
          if (applyTaxToPrice) {
            let taxAmount = initialItemPrice * taxRate;
            taxAmount = Math.round(taxAmount * 100) / 100;
            item.final_price = parseFloat(<string>item.final_price) + taxAmount;
            tax.final_tax = <number>tax.final_tax + taxAmount * item.quantity;
          }

          if (tax.apply_to_shipping_cost) {
            let shippingTax = parseFloat(item.shipping_cost) * taxRate;
            shippingTax = Math.round(shippingTax * 100) / 100;
            tax.final_tax = <number>tax.final_tax + shippingTax * item.quantity;
          }
        });
      });
  }
}
