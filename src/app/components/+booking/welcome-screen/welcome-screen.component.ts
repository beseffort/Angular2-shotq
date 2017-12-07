import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Proposal } from '../../../models/proposal';
import { Signature } from '../../../models/signature.model';


@Component({
  selector: 'booking-welcome-screen',
  templateUrl: './welcome-screen.component.html',
  styleUrls: ['./welcome-screen.component.scss']
})
export class BookingWelcomeScreenComponent implements OnInit {
  proposal: Proposal;
  message: string;
  canEnter: boolean = true;

  constructor(private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.message = (<any>this.route.snapshot.data).message;
    this.route.data
      .subscribe((data: { proposal: Proposal, signature: Signature }) => {
        this.proposal = data.proposal;

        if (this.proposal.expired || this.proposal.status === Proposal.STATUS_CANCELED) {
          this.router.navigate(['../expired'], {relativeTo: this.route});
          return;
        }

        if (this.proposal.status === Proposal.STATUS_ACCEPTED) {
          this.router.navigate(['../accepted'], {relativeTo: this.route});
        }
      });
  }
}
