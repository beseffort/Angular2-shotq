import { Component, Input, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Overlay } from 'single-angular-modal';

import { Job } from '../../../../models/job';
import { Package } from '../../../../models/package';
import { Invoice } from '../../../../models/invoice';
import { InvoiceService } from '../../../../services/client-access/billing/billing.service';
import { JobService } from '../../../../services/job/job.service';



@Component({
  selector: 'app-invoice-view',
  templateUrl: 'invoice-view.component.html',
  styleUrls: [
    'invoice-view.component.scss'
  ],
  // providers: [InvoiceService, PackageService, GeneralFunctionsService]
})
export class InvoiceViewComponent {
  @Input() invoice: any;
  @Input() adminMode = false;

  private isLoading: boolean = false;
  private package: Package;

  constructor(private jobService: JobService,
              overlay: Overlay,
              vcRef: ViewContainerRef) {
    overlay.defaultViewContainer = vcRef;
  }

  ngOnInit() {
    this.jobService
      .getOrCreateProposal(this.invoice.billing_order_data.job)
      .map(proposal => proposal.approved_package_data)
      .subscribe((pckg: Package) => {
        this.package = pckg;
        this.package.addons = this.package.addons.filter(addon => addon.approved);
      }, err => {
        console.error(err);
        this.isLoading = false;
      });
  }
}
