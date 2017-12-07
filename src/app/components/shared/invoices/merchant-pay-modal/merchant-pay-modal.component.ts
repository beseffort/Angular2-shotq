import { Component, ElementRef, isDevMode, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DialogRef, ModalComponent } from 'single-angular-modal';
import { BSModalContext } from 'single-angular-modal/plugins/bootstrap';

import { Invoice } from '../../../../models/invoice';
import { ScheduledPayment } from '../../../../models/scheduled-payment.model';
import { MerchantAccountService } from '../../../../services/merchant-account/merchant-account.service';
import { MerchantAccount } from '../../../../models/merchant-account';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import { ScheduledPaymentService } from '../../../../services/scheduled-payment/scheduled-payment.service';



export class MerchantPayModalContext extends BSModalContext {
  public invoice: Invoice;
  public scheduledPayment: ScheduledPayment;
  public merchantService: MerchantAccountService;
}


@Component({
  selector: 'app-merchant-modal',
  templateUrl: './merchant-pay-modal.component.html',
  styleUrls: [
    './merchant-pay-modal.component.scss'
  ]
})
export class MerchantPayModalComponent implements ModalComponent<MerchantPayModalContext> {
  @ViewChild('braintreeForm') braintreeForm: ElementRef;
  context: MerchantPayModalContext;
  form: FormGroup;
  formFields = {
    braintree_gateway: [
      {'key': 'card_holder', 'name': 'Card Holder'},
      {'key': 'street_address', 'name': 'Street Address'},
      {'key': 'locality', 'name': 'Locality'},
      {'key': 'region', 'name': 'Region'},
      {'key': 'postal_code', 'name': 'postal'},
    ],
    square_gateway: [
      {'key': 'card_holder', 'name': 'Card Holder'},
      {'key': 'buyer_email_address', 'name': 'Email'},
    ]
  };
  fieldLabels: any = {};
  private merchantAccount: MerchantAccount;
  private stripeHandler: any;
  private squarePaymentForm: any;
  private payflowUrl: string;
  private isDevMode: boolean;
  private btreeInstance: any;
  private merchantFormValid = false;
  private isLoading = false;
  private secretToken: string;
  private chargeUrl: string;
  // private braintreeForm: any;


  constructor(public dialog: DialogRef<MerchantPayModalContext>,
              private fb: FormBuilder,
              private flash: FlashMessageService,
              private scheduledPaymentService: ScheduledPaymentService) {
    this.context = dialog.context;
    this.isDevMode = isDevMode();
  }


  ngOnInit() {
    this.getMerchantGateway();
  }

  ngOnDestroy() {
    if (this.squarePaymentForm) {
      this.squarePaymentForm.destroy();
    }
  }


  buildForm() {
    if (!this.formFields.hasOwnProperty(this.merchantAccount.merchant_type)) {
      return;
    }
    let formFields = this.formFields[this.merchantAccount.merchant_type];

    this.form = this.fb.group({});
    formFields.forEach(fieldData => {
      this.fieldLabels[fieldData.key] = fieldData.name;
      this.form.addControl(fieldData.key, this.fb.control('', Validators.required));
    });

  }


  getMerchantGateway() {
    this.scheduledPaymentService.getGatewayData(this.context.scheduledPayment.id)
      .subscribe(res => {
        this.merchantAccount = res;
        this.chargeUrl = `${this.context.merchantService._getItemUrl(this.merchantAccount.id)}charge/`;
        this.initPayment();
        this.buildForm();
      });
  }

  close() {
    this.dialog.dismiss();
  }

  send($event) {
    let chargeMapping = {
      square_gateway: this.chargeSquare,
      braintree_gateway: this.chargeBraintree,
      authorize_gateway: this.chargeAuthorizeNet
      // paypal_gateway: this.chargePaypal
    };
    if (chargeMapping.hasOwnProperty(this.merchantAccount.merchant_type)) {
      chargeMapping[this.merchantAccount.merchant_type].bind(this)($event);
    } else {
      alert('Method not implemented');
    }

    // this.charge({});
    // let data = this.form.value;
    // data.invoice_id = this.context.invoice.id;
    // data.amount = this.context.scheduledPayment.amount;
    // this.merchantService.charge(this.merchantAccount.account.id, data)
    //   .subscribe(res => {
    //     if (res.success) {
    //       this.flash.success(res.message);
    //
    //     } else {
    //       this.flash.error(res.message);
    //
    //     }
    //   });
  }

  valid() {

  }

  chargeSquare($event) {
    this.squarePaymentForm.requestCardNonce();
  }

  charge(data) {
    data.invoice_id = this.context.invoice.id;
    data.amount = this.context.scheduledPayment.amount;
    this.context.merchantService.charge(this.context.invoice.merchant_account_details.id, data)
      .subscribe(res => {
        if (res.success) {
          this.flash.success(res.message);
          this.dialog.close(res);
        } else {
          this.flash.error(res.message);
        }
      });
  }

  buildSquareForm() {
    this.merchantFormValid = true;
    setTimeout(() => {
      this.squarePaymentForm = new SqPaymentForm({
        applicationId: this.merchantAccount.extra.SQUARE_APPLICATION_ID,
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
          inputEventReceived: (event) => {
          },
          paymentFormLoaded: () => {

          },
          cardNonceResponseReceived: (errors, nonce, cardData) => {
            if (errors) {
              errors.forEach(function (error) {
                this.flash.error(error.message);
              });
            } else {
              this.charge(Object.assign({
                card_nonce: nonce,
                billing_address: {
                  address_line_1: '500 Electric Ave',
                  address_line_2: 'Suite 600',
                  administrative_district_level_1: 'NY',
                  locality: 'New York',
                  postal_code: cardData.billing_postal_code,
                  country: 'US'
                }
              }, this.form.value));
            }
          },
        }
      });
      this.squarePaymentForm.build();
    }, 0);
  }

  initPayPal() {
    this.initializeCallbackRecever();
    this.context.merchantService.getPaypalSecureToken(this.context.invoice.merchant_account_details.id)
      .filter(res => res.success)
      .subscribe(res => {
        this.payflowUrl = `${res.response.payflow_url}?SECURETOKEN=${res.response.SECURETOKEN}&SECURETOKENID=${res.response.SECURETOKENID}`;
      });
  }

  initBraintree() {
    this.isLoading = true;
    this.context.merchantService.getSecureToken(this.merchantAccount.id)
      .map(res => res.response.client_token)
      .subscribe(token => {
        braintree.client.create({
          authorization: token
        }, (err, clientInstance) => {
          if (err) {
            console.error(err);
            return;
          }
          this.braintreeCreateHostedFields(clientInstance);
        });
      });
  }

  braintreeCreateHostedFields(clientInstance) {
    braintree.hostedFields.create({
      client: clientInstance,
      styles: {
        'input': {
          'font-size': '14px',
          'font-family': '"Titillium Web", sans-serif',
          'font-weight': 'normal',
          'color': '#3a405b'
        },
        '::placeholder': {
          'color': '#898c9d'
        },
        ':focus': {
          'color': '#3a405b'
        },
        '.valid': {
          'color': '#3a405b'
        }
      },
      fields: {
        number: {
          selector: '#card-number',
          placeholder: '4111 1111 1111 1111'
        },
        cvv: {
          selector: '#cvv',
          placeholder: '123'
        },
        expirationDate: {
          selector: '#expiration-date',
          placeholder: 'MM/YYYY'
        },
        postalCode: {
          selector: '#postal-code',
          placeholder: '11111'
        }
      }
    }, (err, hostedFieldsInstance) => {
      this.isLoading = false;
      this.btreeInstance = hostedFieldsInstance;

      if (hostedFieldsInstance) {
        hostedFieldsInstance.on('validityChange', (event) => {
          let isValid = true;
          for (let fieldKey in event.fields) {
            if (event.fields.hasOwnProperty(fieldKey)) {
              if (!event.fields[fieldKey].isValid) {
                isValid = false;
                break;
              }
            }
          }
          this.merchantFormValid = isValid;
        });
      }
    });
  }

  chargeBraintree($event) {
    this.btreeInstance.tokenize((errors, payload) => {
      this.charge(Object.assign({
        token: payload.nonce,
      }, this.form.value));

    });
  }

  initAuthorizeNet() {
    this.context.merchantService.getSecureToken(this.merchantAccount.id, {
      'amount': parseFloat(<string>this.context.scheduledPayment.balance),
      'url': this.context.merchantService.getPaymentResultUrl(),
      'cancelUrl': this.context.merchantService.getPaymentResultUrl(false)
    })
      .filter(res => {
        if (!res.success) {
          this.flash.error('Error getting token');
        }
        return res.success;
      })
      .map(res => res.response.token)
      .subscribe(token => {
        this.secretToken = token;
        this.chargeAuthorizeNet();
      });
    this.initializeCallbackRecever();
    // window.AuthorizeNetPopup = AuthorizeNetPopup;
  }

  initializeCallbackRecever() {
    (<any>window).onReceiveCommunication = (valid, data) => {
      if (!valid) {
        this.flash.error('Payment was canceled');
      } else {
        this.flash.success('Payment applied successfully. Data will be updated later');
        if (data) {
          this.charge({response: data});
        } else {
          this.dialog.close({});
        }
      }
    };
  }

  chargeAuthorizeNet() {
    setTimeout(() => {
      AuthorizeNetPopup.options.useTestEnvironment = isDevMode();
      AuthorizeNetPopup.openAddPaymentPopup();
    }, 300);
  }

  initPayment() {
    let initMapping = {
      square_gateway: this.buildSquareForm,
      paypal_gateway: this.initPayPal,
      braintree_gateway: this.initBraintree,
      authorize_gateway: this.initAuthorizeNet
    };
    if (initMapping.hasOwnProperty(this.merchantAccount.merchant_type)) {
      initMapping[this.merchantAccount.merchant_type].bind(this)();
    } else {
      alert('Method not implemented');
    }
  }

}
