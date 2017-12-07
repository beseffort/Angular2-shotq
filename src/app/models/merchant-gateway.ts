import { MerchantAccount } from './merchant-account';

interface MerchantGatewayMetaKey {
  key: string;
  name: string;
}

export class MerchantGateway {
  key: string;
  name: string;
  metadata: {
    requires: MerchantGatewayMetaKey[],
    form_fields: MerchantGatewayMetaKey[]
  };
  icon?: string;
  account?: MerchantAccount;
}
