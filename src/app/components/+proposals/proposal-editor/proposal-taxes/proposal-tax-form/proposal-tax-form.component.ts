import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Tax } from '../../../../../models/tax.model';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { FlashMessageService } from '../../../../../services/flash-message/flash-message.service';
import { TaxService } from '../../../../../services/tax/tax.service';
import { TaxTemplateRESTService } from '../../../../../services/tax-template/tax-template.service';
import { TaxTemplate } from '../../../../../models/tax-template.model';
import {
  AMOUNT_CHOICE_FIXED, AMOUNT_CHOICE_PERCENTAGE_RATE,
  RETAIL_PRICE
} from '../../../../../models/discount-template.model';
import {
  amountChoices, calculationChoices, calculationAgainstChoices, paymentScheduleSettings
} from '../../../../../models/tax-template.model';
import { RestClientService } from '../../../../../services/rest-client/rest-client.service';

@Component({
  selector: 'app-proposal-tax-form',
  templateUrl: './proposal-tax-form.component.html',
})
export class ProposalTaxFormComponent {
  @Input() tax: Tax;
  @Input() forTemplate: boolean = false;
  @Input() proposalHasTax: boolean = false;
  @Output() onCancel: EventEmitter<any> = new EventEmitter<any>();
  @Output() savedAsTemplate: EventEmitter<TaxTemplate> = new EventEmitter<TaxTemplate>();
  @Output() templateDeleted: EventEmitter<TaxTemplate> = new EventEmitter<TaxTemplate>();

  taxForm: FormGroup;

  private _RETAIL_PRICE = RETAIL_PRICE;
  private _AMOUNT_CHOICE_PERCENTAGE_RATE = AMOUNT_CHOICE_PERCENTAGE_RATE;
  private _AMOUNT_CHOICE_FIXED = AMOUNT_CHOICE_FIXED;
  private amountChoices = amountChoices;
  private calculationChoices = calculationChoices;
  private calculationAgainstChoices = calculationAgainstChoices;
  private paymentScheduleSettings = paymentScheduleSettings;

  constructor(private formBuilder: FormBuilder,
              private taxService: TaxService,
              private taxTemplateService: TaxTemplateRESTService,
              private flash: FlashMessageService) {
  }

  ngOnChanges() {
    this.buildForm();
  }

  buildCalculateAgainst(value: string) {
    value = value || '';
    return {
      Products: value.includes('Products'),
      Services: value.includes('Services')
    };
  }

  buildForm() {
    this.taxForm = this.formBuilder.group({
      name: ['', Validators.compose([
        // Validators.required,
        // Validators.maxLength(128)
      ])],
      rate: ['0.00', Validators.compose([])],
      apply_to_shipping_cost: [false, Validators.compose([])],
      total_amount: ['0.00', Validators.compose([])],
      amount_by: [this.amountChoices[0].value, Validators.compose([])],
      calculate_against: this.formBuilder.group({
        Products: false,
        Services: false
      }),
      calculate_settings: [this.calculationAgainstChoices[0].value, Validators.compose([])],
      schedule_settings: [this.paymentScheduleSettings[0].value, Validators.compose([])],
      additional_rates: this.formBuilder.array(
        (this.tax.additional_rates || []).map(r => this.formBuilder.control(r))
      )
    });
    this.taxForm.patchValue(Object.assign({}, this.tax, {
      calculate_against: this.buildCalculateAgainst(this.tax.calculate_against)
    }));
  }

  cleanCalculatAgainst(value) {
    if (value.Products) {
      if (value.Services) {
        return 'Products & Services';
      } else {
        return 'Products';
      }
    } else if (value.Services) {
      return 'Services';
    } else {
      return '';
    }
  }

  cleanForm() {
    let res = Object.assign({}, this.taxForm.value);
    res.calculate_against = this.cleanCalculatAgainst(res.calculate_against);
    if (res.amount_by === AMOUNT_CHOICE_PERCENTAGE_RATE) {
      res.total_amount = '0.00';
    } else {
      res.rate = '0.00';
    }
    return res;
  }


  saveAsNew() {
    if (this.taxForm.valid) {
      let tax = this.cleanForm();
      tax.id = tax.proposal = undefined;

      this.taxTemplateService.create(tax)
        .subscribe(newTemplate => {
          this.savedAsTemplate.emit(newTemplate);
          this.flash.success('Tax template created successfully');
          this.cancel();
        });
    }
  }

  save() {
    if (this.taxForm.valid) {
      if (this.proposalHasTax) {
        this.flash.error('Proposal can have only one tax, please remove existing taxes before create new.');
        return;
      }
      Object.assign(this.tax, this.cleanForm());
      let service = this.forTemplate ? this.taxTemplateService : this.taxService;
      (<RestClientService<any>>service).save(this.tax)
        .subscribe((tax: Tax | TaxTemplate) => {
          Object.assign(this.tax, tax);
          this.flash.success(`Tax ${this.forTemplate ? 'template' : ''} saved successfully`);
          this.cancel();
        }, errors => {
          this.flash.error(`Error saving tax ${this.forTemplate ? 'template' : ''}`);
        });
    }
  }

  delete() {
    if (this.forTemplate) {
      let service = this.taxTemplateService;
      service.delete(this.tax.id)
        .subscribe(() => {
          this.templateDeleted.emit(this.tax);
          this.flash.success('Object was deleted successfully');
          this.cancel();
        }, errors => {
          this.flash.error(`Error deleting tax template`);
        });
    }
  }

  cancel() {
    (<any>this.tax).editing = false;
    this.onCancel.emit();
  }

  addAdditionalRate() {
    let control = <FormArray>this.taxForm.controls['additional_rates'];
    control.push(this.formBuilder.control('0.00'));
  }

  removeAdditionalRate(i: number) {
    const control = <FormArray>this.taxForm.controls['additional_rates'];
    control.removeAt(i);
  }
}
