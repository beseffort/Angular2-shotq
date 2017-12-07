import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Observable } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap';

import { SignalService } from 'app/services/signal-service/signal.service';
import { DiscountTemplate } from 'app/models';
import { DiscountTemplateService } from '../../../../../services/discount-template/discount-template.service';
import { FlashMessageService } from '../../../../../services/flash-message/flash-message.service';
import {
  AMOUNT_CHOICE_PERCENTAGE_RATE,
  AMOUNT_CHOICES, APPLY_RULE_BEFORE_TAXES, APPLY_RULE_CHOICES, CALCULATION_CHOICES,
  CALCULATION_SETTINGS_CHOICES, RETAIL_PRICE
} from '../../../../../models/discount-template.model';
import { CURRENT_PROFILE_ID } from '../../../../../services/access/access.service';


@Component({
  selector: 'app-discount-template-add',
  templateUrl: './discount-template-add.component.html',
  styleUrls: ['./discount-template-add.component.scss'],

})
export class DiscountTemplateAddComponent {
  @ViewChild('modal') modal: ModalDirective;

  template: DiscountTemplate | any = {};
  isLoading: boolean = true;
  readOnly: boolean = false;

  private amountChoices = AMOUNT_CHOICES;
  private applyRuleChoices = APPLY_RULE_CHOICES;
  private calculationChoices = CALCULATION_CHOICES;
  private calculationSettingsChoices = CALCULATION_SETTINGS_CHOICES;

  private _RETAIL_PRICE = RETAIL_PRICE;
  private _APPLY_RULE_BEFORE_TAXES = APPLY_RULE_BEFORE_TAXES;
  private _AMOUNT_CHOICE_PERCENTAGE_RATE = AMOUNT_CHOICE_PERCENTAGE_RATE;

  private form: FormGroup;

  constructor(private templateService: DiscountTemplateService,
              private fb: FormBuilder,
              private flash: FlashMessageService,
              private signal: SignalService) {
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.form = this.fb.group({
      name: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(128)
      ])],
      rate: [0, Validators.compose([])],
      total_amount: [0, Validators.compose([])],
      amount_by: [this.amountChoices[0].value, Validators.compose([])],
      apply_rule: [this.applyRuleChoices[0].value, Validators.compose([])],
      calculate_against: [this.calculationChoices[0].value, Validators.compose([])],
      calculate_settings: [this.calculationSettingsChoices[0].value, Validators.compose([])],
    });
  }

  getTemplate(id?: number) {
    this.isLoading = true;

    if (id)
      return this.templateService.get(id);

    return Observable.create(observer => {
      observer.next({
        account: CURRENT_PROFILE_ID,
        rate: 0,
        total_amount: 0,
        amount_by: this.amountChoices[0].value,
        apply_rule: this.applyRuleChoices[0].value,
        calculate_against: this.calculationChoices[0].value,
        calculate_settings: this.calculationSettingsChoices[0].value
      });
      this.isLoading = false;
      observer.complete();
    });
  }

  save() {
    this.isLoading = true;

    if (this.form.invalid)
      return;

    if (this.form.pristine) {
      this.hide();
      return;
    }

    let data = Object.assign({}, this.template, this.cleanForm());
    let method = !!this.template.id ? this.templateService.save : this.templateService.create;
    method.bind(this.templateService)(data)
      .subscribe((template) => {
        this.isLoading = false;
        this.hide();

        this.signal.send({
          group: 'discountTemplate',
          type: !!this.template.id ? 'edit' : 'add',
          instance: template
        });
        this.flash.success('Discount template saved successfully.');
      }, errors => {
        this.isLoading = false;
        this.flash.error('Error saving discount template.');
      });
  }

  cleanForm() {
    let res = Object.assign({}, this.form.value);
    if (res.amount_by === AMOUNT_CHOICE_PERCENTAGE_RATE) {
      res.total_amount = 0;
    } else {
      res.rate = 0;
    }
    return res;
  }

  show(template?: any) {
    let id = template ? template.id : null;
    this.readOnly = !!template;
    this.isLoading = true;

    this.modal.show();
    jQuery('.modal-backdrop')[0].classList.add('modal-backdrop_grey');
    this.getTemplate(id)
      .subscribe((instance: DiscountTemplate) => {
          this.isLoading = false;
          this.template = instance;
          this.form.reset(this.template);
        },
        error => {
          let res = error.json();
          this.flash.error(res.detail || res.message);
          this.isLoading = false;
          this.hide();
        }
      );
  }

  hide() {
    this.modal.hide();
  }

}
