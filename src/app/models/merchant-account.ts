export const PAYMENT_PROVIDERS = {
  authorize_gateway: {
    image: '/assets/img/payments/authorize.svg',
    name: 'authorize'
  },
  braintree_gateway: {
    image: '/assets/img/payments/braintree.png',
    name: 'braintree'
  },
  payjunction_gateway: {
    image: '/assets/img/payments/payjunction.png',
    name: 'payjunction'
  },
  paypal_gateway: {
    image: '/assets/img/payments/paypal.svg',
    name: 'paypal'
  },
  square_gateway: {
    image: '/assets/img/payments/square.svg',
    name: 'square'
  },
  stripe_gateway: {
    image: '/assets/img/payments/stripe.svg',
    name: 'stripe'
  },
};

export class MerchantAccount {
  id?: number;
  created: Date;
  modified: Date;
  name: string;
  merchant_type: string;
  gateway_data: string;
  gateway_name: string;
  supports_visa: boolean;
  supports_mastercard: boolean;
  supports_amex: boolean;
  supports_discover: boolean;
  account: number;
  settings: {
    currency?: string;
    private_key?: string
    public_key?: string
  };
  extra?: {
    SQUARE_APPLICATION_ID?: string
  };
}
