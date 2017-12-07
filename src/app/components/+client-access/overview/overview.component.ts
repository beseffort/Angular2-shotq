import * as _ from 'lodash';
import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
/* Components */
import { TimelineComponent } from '../../shared/timeline/timeline.component';

/* Sign modal */
import {
  ContractPreviewModalComponent,
  ContractPreviewModalContext
} from '../../+contracts/contract-preview/contract-preview-modal/contract-preview-modal.component';
import { Modal, Overlay, overlayConfigFactory } from 'single-angular-modal';
import { StickyButtonsModal } from '../../sq-modal/base-modal-components/sticky-buttons/sticky-buttons-modal.service';

/* Services */
import { ContractService } from '../../../services/contract/contract.service';
import { JobService } from '../../../services/job';
import { TaxService } from '../../../services/tax';
import { DiscountService } from '../../../services/discount';
import { ProposalService } from '../../../services/proposal';
import { InvoiceService } from '../../../services/client-access/billing';
import { SignalService } from '../../../services/signal-service/signal.service';
import { ScheduledPaymentService } from '../../../services/scheduled-payment/scheduled-payment.service';
import { MerchantAccountService } from '../../../services/merchant-account/merchant-account.service';
/* Models */
import { Contract } from '../../../models/contract';
import { Signature } from '../../../models/signature.model';
import { Package } from '../../../models/package';
import { Proposal } from '../../../models/proposal';
import { Job } from '../../../models/job';
import { Discount } from '../../../models/discount.model';
import { Tax } from '../../../models/tax.model';
import { BookingOverview } from '../../../models/proposal-payment-overview.model';
import { Invoice } from '../../../models/invoice';
import { ScheduledPayment } from '../../../models/scheduled-payment.model';

@Component({
  selector: 'overview',
  templateUrl: 'overview.component.html',
  styleUrls: ['overview.component.scss'],
  providers: [
    JobService, InvoiceService,
    TaxService, DiscountService,
    ProposalService, ScheduledPaymentService,
    MerchantAccountService]
})
export class OverviewComponent {
  private job: Job;
  private contract: Contract;
  private signature: Signature;
  private overview: BookingOverview;
  private isLoading: boolean = false;
  private pckg: Package;
  private activeInvoice: Invoice;
  private nextPayment: ScheduledPayment;
  private examplePackageInvoices: Array<any> = [
    {
      'due': '2017-11-30',
      'amount': '12.00',
      'status': 'paid'
    },
    {
      'due': '2017-12-31',
      'amount': '12.00',
      'status': 'paid'
    },
    {
      'due': '2017-04-08',
      'amount': 12.00,
      'status': 'new'
    },
    {
      'due': '2017-05-04',
      'amount': 12.00,
      'status': 'new'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
    private discountService: DiscountService,
    private taxesService: TaxService,
    private proposalService: ProposalService,
    private billingService: InvoiceService,
    private scheduledPaymentService: ScheduledPaymentService,
    private merchantAccountService: MerchantAccountService,
    private signalService: SignalService,
    private overlay: Overlay,
    private vcRef: ViewContainerRef,
    private contractService: ContractService,
    public buttonsModal: StickyButtonsModal
  ) {
    overlay.defaultViewContainer = vcRef;
  }

  ngOnInit() {
    this.route.parent.data.subscribe(data => {
      this.job = data['job'];
      this.loadData();
    });
  }

  loadData() {
    this.isLoading = true;

    let observableArray = [
      this.jobService.getOrCreateProposal(this.job.id),
      this.billingService.getInvoiceInfoByJob(this.job.id)
    ];
    Observable.forkJoin(observableArray)
      .subscribe(([proposal, invoices]: [Proposal, Invoice[]]) => {
        this.activeInvoice = invoices[0];
        this.getNextPayment();
        this.formatWorkerRoles();

        Observable.zip(
          this.discountService.getList({proposal: proposal.id}).map(res => res.results),
          this.taxesService.getList({proposal: proposal.id}).map(res => res.results)
        ).subscribe(([discounts, taxes]: [Discount[], Tax[]]) => {
          this.overview = this.proposalService.generateProposalPaymentOverview(proposal, discounts, taxes);
        });
        this.pckg = proposal.approved_package_data;
        this.contract = proposal.contract_data;
        this.loadSignature();
        this.isLoading = false;
      });
  }

  sign($event?) {
    if ($event) {
      $event.stopPropagation();
      $event.preventDefault();
    }

    this.buttonsModal
      .open(ContractPreviewModalComponent,
        overlayConfigFactory({
          isBlocking: false,
          confirmText: 'Sign and Continue',
          canSign: true,
          contract: this.contract
        }, ContractPreviewModalContext)
      ).then(dialogRef => {
        dialogRef.result.then(result => {
          this.loadSignature();
        });
    });
  }

  pay() {
    this.merchantAccountService.openChargeForm(this.activeInvoice, this.nextPayment)
      .subscribe(res => {
        this.getNextPayment();
        this.signalService.send({
          group: 'payment',
          type: 'applied',
          instance: res
        });
      });
  }

  /**
   * Format the worker roles
   */
  public formatWorkerRoles() {
    for (let worker of this.job.job_workers) {
      if (worker.roles && worker.roles.length === 1) {
        worker['$formattedRoles'] = worker.roles[0].name;
      } else if (worker.roles) {
        let aux = [];
        for (let role of worker.roles) {
          aux.push(role.name);
        }
        if (aux.length > 0) {
          worker['$formattedRoles'] = _.compact(aux).join(', ');
        }
      }
    }
  }

  private loadSignature() {
    this.contractService.mySignature(this.contract.id).subscribe((signature) => {
      this.signature = signature;
    });
  }

  private getNextPayment() {
    this.scheduledPaymentService.getList({invoice: this.activeInvoice.id})
      .map(res => res.results)
      .subscribe((scheduledPayments: ScheduledPayment[]) => {
        this.nextPayment = _.find(scheduledPayments, s => s.balance > 0);
      });
  }
}
