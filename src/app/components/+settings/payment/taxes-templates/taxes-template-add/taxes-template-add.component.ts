import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

import { Observable } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap';

import { TaxTemplate } from '../../../../../models/tax-template.model';
import { TaxTemplateRESTService } from '../../../../../services/tax-template/tax-template.service';
import { FlashMessageService } from '../../../../../services/flash-message/flash-message.service';
import { SignalService } from '../../../../../services/signal-service/signal.service';
import { CURRENT_PROFILE_ID } from '../../../../../services/access/access.service';
import {
  AMOUNT_CHOICE_FIXED, AMOUNT_CHOICE_PERCENTAGE_RATE,
  RETAIL_PRICE
} from '../../../../../models/discount-template.model';
import {
  amountChoices, calculationChoices, calculationAgainstChoices, paymentScheduleSettings
} from '../../../../../models/tax-template.model';



@Component({
  selector: 'app-taxes-template-add',
  templateUrl: './taxes-template-add.component.html',
  styleUrls: ['./taxes-template-add.component.scss'],

})
export class TaxesTemplateAddComponent {
  @ViewChild('modal') modal: ModalDirective;

  template: TaxTemplate | any = {};
  isLoading: boolean = true;
  readOnly: boolean = false;

  private form: FormGroup;

  private _RETAIL_PRICE = RETAIL_PRICE;
  private _AMOUNT_CHOICE_PERCENTAGE_RATE = AMOUNT_CHOICE_PERCENTAGE_RATE;
  private _AMOUNT_CHOICE_FIXED = AMOUNT_CHOICE_FIXED;
  private amountChoices = amountChoices;
  private calculationChoices = calculationChoices;
  private calculationAgainstChoices = calculationAgainstChoices;
  private paymentScheduleSettings = paymentScheduleSettings;



  constructor(private templateService: TaxTemplateRESTService,
              private fb: FormBuilder,
              private flash: FlashMessageService,
              private signal: SignalService) {
  }

  ngOnInit() {
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
    this.form = this.fb.group({
      name: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(128)
      ])],
      rate: ['0.00', Validators.compose([])],
      apply_to_shipping_cost: [false, Validators.compose([])],
      total_amount: ['0.00', Validators.compose([])],
      amount_by: [this.amountChoices[0].value, Validators.compose([])],
      calculate_against: this.fb.group({
        Products: false,
        Services: false
      }),
      calculate_settings: [this.calculationAgainstChoices[0].value, Validators.compose([])],
      schedule_settings: [this.paymentScheduleSettings[0].value, Validators.compose([])],
      additional_rates: this.fb.array([])
    });
  }

  getTemplate(id?: number) {
    this.isLoading = true;

    if (id)
      return this.templateService.get(id);

    return Observable.create(observer => {
      observer.next({
        account: CURRENT_PROFILE_ID,
        rate: '0.00',
        apply_to_shipping_cost: false,
        total_amount: '0.00',
        amount_by: this.amountChoices[0].value,
        calculate_against: '',
        calculate_settings: this.calculationAgainstChoices[0].value,
        schedule_settings: this.paymentScheduleSettings[0].value,
        additional_rates: []
      });
      this.isLoading = false;
      observer.complete();
    });
  }

  cleanCalculateAgainst(value) {
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
    let res = Object.assign({}, this.form.value);
    res.calculate_against = this.cleanCalculateAgainst(res.calculate_against);
    if (res.amount_by === AMOUNT_CHOICE_PERCENTAGE_RATE) {
      res.total_amount = '0.00';
    } else {
      res.rate = '0.00';
    }
    return res;
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
          group: 'taxesTemplate',
          type: !!this.template.id ? 'edit' : 'add',
          instance: template
        });
        this.flash.success('Taxes template saved successfully.');
      }, errors => {
        this.isLoading = false;
        this.flash.error('Error saving taxes template.');
      });
  }

  show(template?: any) {
    let id = template ? template.id : null;
    this.readOnly = !!template;
    this.isLoading = true;

    this.modal.show();
    jQuery('.modal-backdrop')[0].classList.add('modal-backdrop_grey');
    this.getTemplate(id)
      .subscribe((instance: TaxTemplate) => {
          this.isLoading = false;
          this.template = instance;
          this.form.controls['additional_rates'] = this.fb.array(
            this.template.additional_rates.map(r => this.fb.control(r))
          );
          this.form.reset(Object.assign({}, this.template, {
            calculate_against: this.buildCalculateAgainst(this.template.calculate_against),
          }));
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

  addAdditionalRate() {
    let control = <FormArray>this.form.controls['additional_rates'];
    control.push(this.fb.control('0.00'));
  }

  removeAdditionalRate(i: number) {
    const control = <FormArray>this.form.controls['additional_rates'];
    control.removeAt(i);
  }

}
