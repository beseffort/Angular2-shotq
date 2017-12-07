import { Injectable } from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { MerchantAccount, PAYMENT_PROVIDERS } from '../../models/merchant-account';
import { MerchantGateway } from '../../models/merchant-gateway';
import { ScheduledPayment } from '../../models/scheduled-payment.model';
import { Modal, overlayConfigFactory } from 'single-angular-modal';
import { ApiService } from '../api/api.service';
import { Invoice } from '../../models/invoice';
import { FlashMessageService } from '../flash-message/flash-message.service';
import { Observable } from 'rxjs/Observable';
import { AccessService } from '../access/access.service';
import {
  PayWithCheckModal,
  PayWithCheckModalContext
} from '../../components/+settings/payment/modal/pay-with-check/pay-with-check.modal';
import {
  MerchantPayModalComponent,
  MerchantPayModalContext
} from '../../components/shared/invoices/merchant-pay-modal/merchant-pay-modal.component';


@Injectable()
export class MerchantAccountService extends RestClientService<MerchantAccount> {
  baseUrl = 'payment/merchantaccount';

  constructor(public modal: Modal,
              public flashService: FlashMessageService,
              public accountService: AccessService,
              apiService: ApiService) {
    super(apiService);
  }

  getMerchantGateways() {
    return this.listGet('gateways')
      .map((gateways: MerchantGateway[]) => {
        return gateways.map(gateway => {
          gateway.icon = PAYMENT_PROVIDERS[gateway.key].image;
          return gateway;
        });
      });
  }

  test(id: number, data: any) {
    return this.itemPost(id, 'test', data);
  }

  charge(id: number, data: any) {
    return this.itemPost(id, 'charge', data);
  }

  getPaymentResultUrl(success = true) {
    return `${process.env.APICONFIG.apiUrl}/payment/payment_received${success ? '' : '?success=false'}`;
  }

  getPaypalSecureToken(id: number) {
    return this.itemPost(id, 'paypal_secure_token', {
      'RETURNURL': this.getPaymentResultUrl(),
      'ERRORURL': this.getPaymentResultUrl(false),
      'merchant_type': 'paypal_gateway',
      'amount': 1.00
    });
  }

  getSecureToken(id: number, data = {}) {
    return this.itemPost(id, 'secure_token', data);
  }

  squareCallback(id: number, data = {}) {
    return this.itemPost(id, 'square_callback', data);
  }

  getSquareLocations(id: number) {
    return this.itemGet(id, 'square_locations');
  }

  payWithCheck(invoice) {
    return Observable.create(observer => {
      this.modal
        .open(PayWithCheckModal,
          overlayConfigFactory({
            invoice: invoice
          }, PayWithCheckModalContext))
        .then(dialogRef => {
          dialogRef.result
            .then(result => {
              observer.next(result);
              observer.complete();
              // Catching close event with result data from modal
              // console.log(result)
            })
            .catch(() => {
              // Catching dismiss event with no results
              // console.log('rejected')
            });
        });
    });
  }

  openChargeForm(invoice: Invoice, scheduledPayment: ScheduledPayment) {
    let methodMaping = {
      'stripe_gateway': this.stripeChargeForm,
      'square_gateway': this.modalChargeForm,
      'paypal_gateway': this.modalChargeForm,
      'braintree_gateway': this.modalChargeForm,
      'authorize_gateway': this.modalChargeForm,
    };
    if (invoice.merchant_account) {

      return methodMaping[invoice.merchant_account_details.merchant_type].bind(this)(invoice, scheduledPayment);
    } else {
      this.flashService.error('Invoice has no merchant account set, need manual payment form ');
    }
  }

  modalChargeForm(invoice, scheduledPayment: ScheduledPayment) {
    return Observable.create(observer => {
      this.modal
        .open(MerchantPayModalComponent, overlayConfigFactory({
          isBlocking: false,
          invoice: invoice,
          scheduledPayment: scheduledPayment,
          merchantService: this
        }, MerchantPayModalContext))
        .then(dialogRef => {
          dialogRef.result
            .then(result => {
              observer.next(result);
              observer.complete();
            })
            .catch(() => {
              // observer.error();
            });
        });
    });


  }


  stripeChargeForm(invoice: Invoice, scheduledPayment: ScheduledPayment) {
    return Observable.create(observer => {
      let stripeHandler = StripeCheckout.configure({
        key: invoice.merchant_account_details.settings.public_key,
        // image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
        // description: '2 widgets',
        locale: 'auto',
        token: (token) => {
          this.charge(invoice.merchant_account_details.id, {
            token: token.id,
            amount: scheduledPayment.balance,
            invoice_id: scheduledPayment.invoice
          }).subscribe(res => {
            if (res.success) {
              observer.next(res);
              observer.complete();
              this.flashService.success(res.message);
            } else {
              observer.error(res);
              this.flashService.error(res.message);
            }
          }, error => {
            observer.error(error);
          });
        }
      });

      stripeHandler.open({
        // name: 'Stripe.com',
        zipCode: true,
        amount: <number>scheduledPayment.balance * 100
      });

    });

  }


}
