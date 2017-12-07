import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import * as _ from 'lodash';

import { Proposal } from '../../../../../models/proposal';
import { ProposalService } from '../../../../../services/proposal/proposal.service';
import { FlashMessageService } from '../../../../../services/flash-message/flash-message.service';
import { Package } from '../../../../../models/package';
import { Worker } from '../../../../../models/worker';



@Component({
  selector: 'job-proposal-overview',
  templateUrl: 'proposal-overview.component.html',
  styleUrls: ['proposal-overview.component.scss'],
  providers: []
})
export class JobProposalOverviewComponent implements OnInit {
  @Input() proposalId: number;

  public proposal: Proposal;
  public package: Package;
  public addons: any[];
  public workers: Worker[] = [];
  public isLoading: boolean = false;

  constructor(public proposalService: ProposalService,
              public flash: FlashMessageService) {

  }

  public ngOnInit() {
  }

  public ngOnChanges(changes) {
    if (changes['proposalId']) {
      this.loadProposal();
      this.loadWorkers();
    }
  }

  loadProposal() {
    this.isLoading = true;
    this.proposalService
      .get(this.proposalId)
      .subscribe(
        (proposal) => {
          this.proposal = proposal;
          this.package = proposal.approved_package_data;
          this.addons = _.filter(this.package.addons, {approved: true});
        },
        () => {
          this.flash.error('Error loading proposal data.');
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  loadWorkers() {
    this.isLoading = true;
    this.proposalService
      .itemGet(this.proposalId, 'workers')
      .subscribe(
        (workers) => {
          this.workers = workers;
        },
        () => {
          this.flash.error('Error loading proposal data.');
        },
        () => {
          this.isLoading = false;
        }
      );
  }

}
