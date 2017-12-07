import { BSModalContext } from 'single-angular-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from 'single-angular-modal';
import { Component } from '@angular/core';
import { AccountService } from '../../../../../services/account/account.service';
import { Account } from '../../../../../models/account';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Invoice } from '../../../../../models/invoice';

export class PayWithCheckModalContext extends BSModalContext {
  invoice: Invoice;
}

@Component({
  selector: 'app-pay-with-check-modal',
  templateUrl: './pay-with-check.modal.html',
  styleUrls: [
    './pay-with-check.modal.scss'
  ]
})
export class PayWithCheckModal implements ModalComponent<PayWithCheckModalContext> {
  context: PayWithCheckModalContext;
  message = '';
  account: Account;
  form: FormGroup;


  constructor(public dialog: DialogRef<PayWithCheckModalContext>,
              private fb: FormBuilder,
              private accountService: AccountService) {
    this.context = dialog.context;
    this.buildForm();
    this.getAccount();
  }

  buildForm() {
    this.form = this.fb.group({
      message: ['', Validators.required]
    });
  }

  getAccount() {
    this.accountService.get(this.context.invoice.account)
      .subscribe(res => {
        this.account = res;
      });
  }

  save() {
    this.dialog.close();
  }

  close() {
    this.dialog.dismiss();
  }


}
