import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Proposal } from '../../../../models/proposal';
import { DiscountService } from '../../../../services/discount/discount.service';
import { Discount } from '../../../../models/discount.model';
import { Item } from '../../../../models/item';
import { ProposalService } from '../../../../services/proposal/proposal.service';
import { TaxService } from '../../../../services/tax/tax.service';
import { Observable } from 'rxjs';
import { Tax } from '../../../../models/tax.model';
import { BookingOverview } from '../../../../models/proposal-payment-overview.model';


@Component({
  selector: 'booking-overview',
  templateUrl: './booking-overview.component.html',
  styleUrls: ['./booking-overview.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BookingOverviewComponent {
  @Input() proposal: Proposal;
  @Output() overviewUpdated: EventEmitter<BookingOverview> = new EventEmitter<BookingOverview>();
  overview: BookingOverview = {
    packagePrice: 0,
    selectedAddons: <Item[]>[],
    discounts: 0,
    shipping: 0,
    tax: 0,
    totalPrice: 0,
    subtotal: 0
  };
  private discounts: Discount[] = [];
  private taxes: Tax[] = [];
  private itemsAndAddons: Item[];

  constructor(private discountService: DiscountService,
              private taxesService: TaxService,
              private proposalService: ProposalService) {
  }

  ngOnInit() {
    Observable.zip(
      this.discountService.getList({proposal: this.proposal.id}).map(res => res.results),
      this.taxesService.getList({proposal: this.proposal.id}).map(res => res.results),
    ).subscribe(([discounts, taxes]: [Discount[], Tax[]]) => {
      this.discounts = discounts;
      this.taxes = taxes;
      this.calculateOverview();
    });
  }

  calculateOverview() {
    this.overview = this.proposalService.generateProposalPaymentOverview(this.proposal, this.discounts, this.taxes);
    this.overviewUpdated.emit(this.overview);
  }

}
