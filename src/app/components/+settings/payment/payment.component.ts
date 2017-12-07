import { Component } from '@angular/core';

import { BreadcrumbService } from '../../shared/breadcrumb/components/breadcrumb.service';


@Component({
  selector: 'payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentAndInvoicesComponent {
  constructor(private breadcrumbService: BreadcrumbService) {
    breadcrumbService.addFriendlyNameForRoute('/settings/payment-and-invoices', 'Payments & Invoice Settings');
  }

  ngOnInit() {
  }
}
