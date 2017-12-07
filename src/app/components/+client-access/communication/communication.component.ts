import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SentCorrespondence } from '../../../models/sentcorrespondence';
import { Job } from '../../../models/job';
import { SentCorrespondenceService } from '../../../services/sent-correspondence';
import { MessagingUiService } from '../../shared/messaging-ui/messaging-ui.service';
import { Overlay } from 'single-angular-modal/esm';

@Component({
  selector: 'communication',
  templateUrl: './communication.component.html',
  styleUrls: ['./communication.component.scss'],
})
export class CommunicationComponent implements OnInit {
  job: Job;
  correspondence: SentCorrespondence[] = [];

  constructor(private messagingUiService: MessagingUiService,
              private route: ActivatedRoute,
              private sentCorrespondenceService: SentCorrespondenceService,
              overlay: Overlay,
              vcRef: ViewContainerRef,
  ) {
    // This is a workaround for the issue where Modal doesn't work with lazy
    // modules. See http://bit.ly/2qqlpDX for details.
    overlay.defaultViewContainer = vcRef;
  }

  ngOnInit() {
    this.route.parent.data.subscribe((data: { job: Job }) => {
      this.job = data.job;
      this.sentCorrespondenceService.getList({job: this.job.id}).subscribe(res => {
        this.correspondence = res.results;
      });
    });
  }

  private onDisplayMessage(message: SentCorrespondence) {
    this.messagingUiService.displayViewMessageDialog(message)
      .subscribe(changedMessage => {
      });
  }
}
