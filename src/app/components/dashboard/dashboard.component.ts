import { Component, OnInit, ViewContainerRef } from '@angular/core';

import { Overlay } from 'single-angular-modal';

import { BreadcrumbService } from '../shared/breadcrumb/components/breadcrumb.service';
import { JobService } from '../../services/job';
import { InvoiceService } from '../../services/client-access/billing/billing.service';
import { AppliedPaymentService } from '../../services/applied-payment';
import { AccessService } from '../../services/access';


@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  newLeadsStat: {new_leads_count: number, close_rate: number};
  outstandingInvoicesStat: {amount: number, invoices_count: number};
  incomePaymentsStat: {month: string, amount_sum: number}[];
  currentUser: {};

  constructor(
    private overlay: Overlay,
    private vcRef: ViewContainerRef,
    private breadcrumbService: BreadcrumbService,
    private jobService: JobService,
    private invoiceService: InvoiceService,
    private appliedPaymentService: AppliedPaymentService,
    private accessSerivce: AccessService
  ) {
    overlay.defaultViewContainer = vcRef;
    breadcrumbService.addFriendlyNameForRoute('/dashboard', 'Dashboard');
  }

  ngOnInit() {
    this.jobService.getNewLeadsStat().subscribe(stat => {
      this.newLeadsStat = stat;
    });
    this.invoiceService.getOutstanding().subscribe(stat => {
      this.outstandingInvoicesStat = stat;
    });
    this.appliedPaymentService.getIncomePaymentsStat().subscribe(stat => {
      this.incomePaymentsStat = stat; // .map(x => {return {month: x.month, amount_sum: x.amount_sum + _.random(0, 5000) }});
    });
    this.accessSerivce.getUserProfileInfo().subscribe(user => {
      this.currentUser = user;
    });
  }

}
