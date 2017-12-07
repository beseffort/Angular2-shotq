import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Discount } from '../../../../../models/discount.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DiscountService } from '../../../../../services/discount/discount.service';
import { FlashMessageService } from '../../../../../services/flash-message/flash-message.service';
import { DiscountTemplateService } from '../../../../../services/discount-template/discount-template.service';
import {
  DiscountTemplate, AMOUNT_CHOICES, APPLY_RULE_CHOICES,
  CALCULATION_CHOICES, AMOUNT_CHOICE_PERCENTAGE_RATE, CALCULATION_SETTINGS_CHOICES, RETAIL_PRICE,
  APPLY_RULE_BEFORE_TAXES
} from '../../../../../models/discount-template.model';
import { PercentPipe } from '@angular/common';

@Component({
  selector: 'app-proposal-discount-form',
  templateUrl: './proposal-discount-form.component.html'
})
export class ProposalDiscountFormComponent {
  @Input() discount: Discount;
  @Input() forTemplate: boolean = false;
  @Output() onChange: EventEmitter<Discount> = new EventEmitter<Discount>();
  @Output() onCancel: EventEmitter<any> = new EventEmitter<any>();
  @Output() savedAsTemplate: EventEmitter<DiscountTemplate> = new EventEmitter<DiscountTemplate>();
  @Output() templateDeleted: EventEmitter<DiscountTemplate> = new EventEmitter<DiscountTemplate>();

  private discountForm: FormGroup;

  private amountChoices = AMOUNT_CHOICES;
  private applyRuleChoices = APPLY_RULE_CHOICES;
  private calculationChoices = CALCULATION_CHOICES;
  private calculationSettingsChoices = CALCULATION_SETTINGS_CHOICES;

  private _RETAIL_PRICE = RETAIL_PRICE;
  private _APPLY_RULE_BEFORE_TAXES = APPLY_RULE_BEFORE_TAXES;
  private _AMOUNT_CHOICE_PERCENTAGE_RATE = AMOUNT_CHOICE_PERCENTAGE_RATE;


  constructor(private formBuilder: FormBuilder,
              private flash: FlashMessageService,
              private discountTemplateService: DiscountTemplateService,
              private discountService: DiscountService) {
  }

  ngOnChanges() {
    this.buildForm();
  }


  buildForm() {
    this.discountForm = this.formBuilder.group({
      name: ['', Validators.compose([
        // Validators.required,
        // Validators.maxLength(128)
      ])
      ],
      rate: [0, Validators.compose([])
      ],
      total_amount: [0, Validators.compose([])],
      amount_by: [this.amountChoices[0].value, Validators.compose([])],
      apply_rule: [this.applyRuleChoices[0].value, Validators.compose([])],
      calculate_against: [this.calculationChoices[0].value, Validators.compose([])],
      calculate_settings: [this.calculationSettingsChoices[0].value, Validators.compose([])],
    });

    this.discountForm.patchValue(this.discount);

  }

  saveAsNew() {
    if (this.discountForm.valid) {
      let template = this.cleanForm();

      this.discountTemplateService.create(template)
        .subscribe(newTemplate => {
          this.savedAsTemplate.emit(newTemplate);
          this.flash.success('Discount template created successfully');
          this.cancel();
        });
    }
  }

  cleanForm() {
    let res = Object.assign({}, this.discountForm.value);
    if (res.amount_by === AMOUNT_CHOICE_PERCENTAGE_RATE) {
      res.total_amount = 0;
    } else {
      res.rate = 0;
    }
    return res;
  }

  save() {
    if (this.discountForm.valid) {
      let data = Object.assign({}, this.discount, this.cleanForm());
      let service = this.forTemplate ? this.discountTemplateService : this.discountService;
      (<DiscountService>service).save(data)
        .subscribe((discount: Discount) => {
          Object.assign(this.discount, discount);
          this.onChange.emit(discount);
          this.flash.success(`Discount ${this.forTemplate ? 'template' : ''} saved successfully`);
          this.cancel();
        }, errors => {
          this.flash.error(`Error saving discount ${this.forTemplate ? 'template' : ''}`);

        });
    }
  }

  delete() {
    if (this.forTemplate) {
      let service = this.discountTemplateService;
      service.delete(this.discount.id)
        .subscribe(() => {
          this.templateDeleted.emit(this.discount);
          this.flash.success('Object was deleted successfully');
          this.cancel();
        }, errors => {
          this.flash.error(`Error deleting discount template`);
        });
    }
  }

  cancel() {
    (<any>this.discount).editing = false;
    this.onCancel.emit();
  }
}
