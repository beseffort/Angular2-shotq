import { FormGroup, FormBuilder } from '@angular/forms';

export interface PaymentMethod {
  merchant_account: number;
  collect_manually: boolean;
  pay_with_check: boolean;
}

export function createPaymentMethodForm(fb: FormBuilder, paymentData: PaymentMethod): FormGroup {
  let form = fb.group({
    merchant_account: [paymentData.merchant_account],
    collect_manually: [Boolean(paymentData.collect_manually)],
    pay_with_check: [Boolean(paymentData.pay_with_check)]
  });
  form.controls['collect_manually'].valueChanges.subscribe((collectMannualy) => {
    if (collectMannualy) {
      form.patchValue({merchant_account: null});
    } else {
      form.patchValue({pay_with_check: false});
    }
  });
  form.controls['pay_with_check'].valueChanges.subscribe((payWithCkeck) => {
    if (payWithCkeck && form.value['collect_manually']) {
      form.patchValue({collect_manually: false});
    }
  });
  form.controls['merchant_account'].valueChanges.subscribe((merchantAccount) => {
    if (merchantAccount && form.value['collect_manually']) {
      form.patchValue({collect_manually: false});
    }
  });
  return form;
}
