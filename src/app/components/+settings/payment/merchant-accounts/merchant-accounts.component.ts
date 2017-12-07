import { Component, OnInit, ViewChild } from '@angular/core';
import { MerchantAccountService } from '../../../../services/merchant-account/merchant-account.service';
import { MerchantAccount } from '../../../../models/merchant-account';
import { AlertifyService } from '../../../../services/alertify/alertify.service';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import { MerchantFormComponent } from './merchant-form/merchant-form.component';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MerchantGateway } from '../../../../models/merchant-gateway';

@Component({
  selector: 'app-merchant-accounts',
  templateUrl: './merchant-accounts.component.html',
  styleUrls: [
    './merchant-accounts.component.scss'
  ]
})
export class MerchantAccountsComponent implements OnInit {
  @ViewChild(MerchantFormComponent) merchantForm: MerchantFormComponent;

  private accounts: MerchantAccount[] = [];
  private newMerchantList: any[] = [];
  private currentAccount: MerchantAccount | any = {};
  private merchantGateways: any[] = [];
  private accounts$ = new Subject<any>();
  private gateways$ = new Subject<any>();
  private dataSub$: Subscription;


  constructor(private merchantAccountService: MerchantAccountService,
              private alertify: AlertifyService,
              private flash: FlashMessageService) {
  }

  ngOnInit() {
    this.dataSub$ = Observable
      .combineLatest(
        this.accounts$,
        this.gateways$
      ).subscribe(([accounts, gateways]: [MerchantAccount[], MerchantGateway[]]) => {
        this.accounts = accounts;
        this.merchantGateways = gateways;
        this.merchantGateways.forEach(gw => {
          gw.account = this.accounts.find(acc => acc.merchant_type === gw.key);
        });
      });

    this.getMerchantAccounts();
    this.getMerchatGateways();
  }

  ngOnDestroy() {
    this.dataSub$.unsubscribe();
  }

  getMerchantAccounts() {
    this.merchantAccountService.getList()
      .first()
      .subscribe(res => this.accounts$.next(res));
  }

  getMerchatGateways() {
    this.merchantAccountService.getMerchantGateways()
      .first()
      .subscribe(res => this.gateways$.next(res));
  }

  getListOfAddingMerchants() {
    this.newMerchantList = this.merchantGateways
      .filter(gw => !this.accounts.find(acc => acc.merchant_type === gw.key));
  }

  editAccount(account: MerchantAccount) {
    this.currentAccount = account;
    this.newMerchantList = this.merchantGateways;
    setTimeout(() => {
      this.merchantForm.show(account);
    });
  }

  addAccount(gateway: MerchantGateway) {
    this.merchantForm.show({
      merchant_type: gateway.key,
    });
  }

  onGatewayClick(gateway) {
    if (!!gateway.account) {
      this.editAccount(gateway.account);
    } else {
      this.addAccount(gateway);
    }
  }

  deleteGateway(gateway: MerchantGateway) {
    let account = gateway.account;
    this.alertify.confirm(`Do you really want to delete ${gateway.name}?`, () => {
      this.merchantAccountService.delete(account.id)
        .subscribe(res => {
          this.flash.success(`Merchant account "${gateway.name}" deleted successfully`);
          this.getMerchantAccounts();
        }, error => {
          this.flash.error(`Error deleting account "${gateway.name}"`);
        });
    });
  }

}
