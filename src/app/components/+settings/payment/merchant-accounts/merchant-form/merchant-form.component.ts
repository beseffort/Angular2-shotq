import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MerchantAccount } from '../../../../../models/merchant-account';
import { MerchantAccountService } from '../../../../../services/merchant-account/merchant-account.service';
import { FlashMessageService } from '../../../../../services/flash-message/flash-message.service';
import { setTimeout } from 'timers';

@Component({
  selector: 'app-merchant-form',
  templateUrl: './merchant-form.component.html',
  styleUrls: [
    './merchant-form.component.scss'
  ]
})
export class MerchantFormComponent implements OnInit {
  @Input() merchantTypeChoices: any[];
  @Output() onSave = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<any>();
  @ViewChild(ModalDirective) modal: ModalDirective;

  testing = false;
  account: MerchantAccount | any = {};
  form: FormGroup;
  merchantForm: FormGroup;
  testForm: FormGroup;

  // Legacy, refactoring needed
  requiredFields = {
    braintree_merchant_id: false,
    currency: false,
    login: false,
    merchant_login: false,
    partner: false,
    password: false,
    private_key: false,
    public_key: false
  };

  testFormFields = {
    // authorize_gateway: [
    //   {key: 'card_number', name: 'Card Number'},
    //   {key: 'card_expire_month', name: 'Expiration month'},
    //   {key: 'card_expire_year', name: 'Expiration year'},
    // ],
    braintree_gateway: [
      {key: 'card_holder', name: 'Name on Card'},
      {key: 'street_address', name: 'Address'},
      {key: 'locality', name: 'City'},
      {key: 'region', name: 'State'},
      {key: 'postal_code', name: 'Zip Code'},
    ],
    stripe_gateway: [
      {key: 'number', name: 'Card Number'},
      {key: 'exp_month', name: 'Expiration month'},
      {key: 'exp_year', name: 'Expiration year'},
      {key: 'cvv', name: 'CVV'},
    ],
    // paypal_gateway: []
    square_gateway: []
  };

  fieldLabels = {};
  currencyChoices = [
    {value: 'USD', label: 'US Dollars'},
    {value: 'CAD', label: 'Canadian Dollars'},
    {value: 'AUD', label: 'Australian Dollars'}
  ];
  currentGateway: any = {};
  private payflow_url: string;
  private showTestForm = true;
  private squarePaymentForm: any;
  private squareLocations: any[];

  constructor(private fb: FormBuilder,
              private flash: FlashMessageService,
              private merchantService: MerchantAccountService) {
    this.buildForm();
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.squarePaymentForm) {
      this.squarePaymentForm.destroy();
    }
  }


  ngOnChanges(changes) {
  }

  show(account) {
    this.testing = false;
    this.account = account;
    this.payflow_url = '';

    this.account.settings = this.account.settings || {};
    this.account.settings.currency = this.account.settings.currency || 'USD';

    let gateway = this.merchantTypeChoices.find(gw => gw.key === this.account.merchant_type);
    this.onGatewaySelect(gateway);

    this.modal.show();
    jQuery('.modal-backdrop')[0].classList.add('modal-backdrop_grey');
  }

  buildForm() {
    this.form = this.fb.group({
      settings: this.fb.group({})
    });
  }

  buildTestForm(gwKey) {
    let formFields = {};
    this.testFormFields[gwKey].forEach(fieldData => {
      formFields[fieldData.key] = ['', Validators.required];
    });
    this.testForm = this.fb.group(formFields);
  }

  buildSquareTestForm() {
    setTimeout(() => {
      this.squarePaymentForm = new SqPaymentForm({
        applicationId: 'sandbox-sq0idp-4ncm508_PKivbw0YOxcJiw',
        inputClass: 'sq-input',

        cardNumber: {
          elementId: 'sq-card-number',
          placeholder: '•••• •••• •••• ••••'
        },
        cvv: {
          elementId: 'sq-cvv',
          placeholder: 'CVV'
        },
        expirationDate: {
          elementId: 'sq-expiration-date',
          placeholder: 'MM/YY'
        },
        postalCode: {
          elementId: 'sq-postal-code'
        },
        callbacks: {
          cardNonceResponseReceived: (errors, nonce, cardData) => {
            if (errors) {
              errors.forEach((error) => {
                this.flash.error(error.message);
              });
            } else {
              this.charge({
                card_nonce: nonce
              });
            }
          },
        }
      });
      this.squarePaymentForm.build();
    }, 0);
  }

  getSquareLocations() {

    this.merchantService.getSquareLocations(this.account.id)
      .subscribe(res => {
        this.squareLocations = res.locations;
      });
  }

  prepareAccount() {
    Object.assign(this.account, this.form.value);
    for (let key in this.requiredFields) {
      if (this.requiredFields.hasOwnProperty(key)
        && !this.requiredFields[key] && key in this.account.settings) {
        delete this.account.settings[key];
      }
    }
  }

  onGatewaySelect(gw) {
    this.currentGateway = gw;

    if (this.currentGateway.key === 'square_gateway') {
      this.setRequiredFields(gw, false);
      this.getSquareLocations();
    } else {
      this.setRequiredFields(gw);

    }
  }

  clearSettingsFormGroup() {
    let settingsGroup = (<{ settings: FormGroup }>this.form.controls).settings;
    for (let key in settingsGroup.controls) {
      if (settingsGroup.controls.hasOwnProperty(key)) {
        settingsGroup.removeControl(key);
      }
    }
    return settingsGroup;
  }

  setRequiredFields(gw, required = true) {
    for (let key in this.requiredFields) {
      if (this.requiredFields.hasOwnProperty(key)) {
        this.requiredFields[key] = false;
      }
    }

    let settingsGroup = this.clearSettingsFormGroup();
    gw.metadata.forEach(meta => {
      this.requiredFields[meta.key] = true;
      this.fieldLabels[meta.key] = meta.name;
      settingsGroup.addControl(meta.key, new FormControl(this.account.settings[meta.key], required ? Validators.required : null));
    });
  }

  enableTestMode() {
    if (this.form.valid) {
      this.save(false);
      this.testing = true;
      if (this.account.merchant_type === 'paypal_gateway') {
        this.showTestForm = false;
        this.merchantService.getPaypalSecureToken(this.account.id)
          .filter(res => res.success)
          .subscribe(res => {
            this.payflow_url = `${res.response.payflow_url}?SECURETOKEN=${res.response.SECURETOKEN}&SECURETOKENID=${res.response.SECURETOKENID}`;

          });

      } else if (this.account.merchant_type === 'square_gateway') {
        this.showTestForm = true;
        this.buildSquareTestForm();

      } else {
        this.showTestForm = true;
      }
      this.buildTestForm(this.account.merchant_type);
    }
  }

  requestSquareCardNonce() {
    this.squarePaymentForm.requestCardNonce();
  }

  toggleAuthorizeSquare() {

    if (this.account.settings.access_token) {
      this.form.patchValue({
        settings: {
          access_token: '',
          location_id: ''
        }
      });
      this.save();
    } else {
      let redirect_uri = `${this.merchantService.apiService.apiUrl}${this.merchantService._getItemUrl(this.account.id)}square_callback`;
      // redirect_uri = redirect_uri.replace('http:', 'https:');
      let square_oauth_url = 'https://connect.squareup.com/oauth2/authorize';
      let scope = 'MERCHANT_PROFILE_READ+CUSTOMERS_READ+CUSTOMERS_WRITE+PAYMENTS_READ+PAYMENTS_WRITE';
      let square_application_id = this.currentGateway.SQUARE_APPLICATION_ID;
      let url = `${square_oauth_url}?client_id=${square_application_id}&redirect_uri=${redirect_uri}&scope=${scope}`;
      window.location.href = url;
    }


  }


  close() {
    this.currentGateway = {};
    this.clearSettingsFormGroup();
    this.modal.hide();
    this.onClose.emit();
  }

  onChargeClick() {
    if (this.account.merchant_type === 'square_gateway') {
      this.requestSquareCardNonce();
    } else {
      this.charge();
    }

  }

  charge(data?: any) {
    if (this.testForm.valid) {
    }
    if (this.account.merchant_type === 'paypal_gateway') {
      this.merchantService.getPaypalSecureToken(this.account.id)
        .switchMap(() => this.merchantService.test(this.account.id, this.testForm.value))
        .subscribe(res => {
        });
    } else {
      this.merchantService.test(this.account.id, data || this.testForm.value)
        .subscribe(res => {
          if (res.success) {
            this.flash.success(`Test transaction successful, transaction id: ${res.transaction_id}`);
          } else {
            this.flash.error(res.message);
          }
        });
    }
  }

  save(close = false) {
    if (this.form.valid) {
      let isNew = !this.account.id;
      this.prepareAccount();
      let data = this.account;
      // if (data.merchant_type === 'square_gateway') {
      //   delete data.settings
      // }
      this.merchantService.save(data)
        .subscribe(res => {
          this.onSave.emit();
          this.account = res;
          this.flash.success(`Merchant account ${isNew ? 'created' : 'saved'} successfully`);
          if (close)
            this.close();
        });
    }

  }
}
