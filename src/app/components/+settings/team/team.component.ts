import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { BreadcrumbService } from '../../shared/breadcrumb/components/breadcrumb.service';
import { Worker } from '../../../models/worker';
import { AccessService } from '../../../services/access/access.service';
import { WorkerInlineComponent } from './worker-inline/worker-inline.component';
import { Invitation } from '../../../models/invitation';
import { InvitationInlineComponent } from './invitation-inline/invitation-inline.component';
import { Modal, Overlay, overlayConfigFactory } from 'single-angular-modal';
import { InvitationModalComponent, InvitationModalWindowData } from './invitation-modal/invitation-modal.component';
import * as _ from 'lodash';


@Component({
  selector: 'team-settings',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
  providers: [WorkerInlineComponent, InvitationInlineComponent]
})
export class TeamComponent implements OnInit {
  private contractorWorkers: Worker[] = [];
  private studioWorkers: Worker[] = [];
  private invitations: Invitation[] = [];
  private isLoading: boolean;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private accessService: AccessService,
    private modal: Modal,
    private overlay: Overlay,
    private vcRef: ViewContainerRef,
  ) {
    overlay.defaultViewContainer = vcRef;
    breadcrumbService.addFriendlyNameForRoute('/settings/team', 'Team and User Roles');
  }

  ngOnInit() {
    this.getWorkers();
  }

  getWorkers() {
    this.isLoading = true;
    this.accessService.getAccountWorkerList()
      .subscribe(
        (data) => {
          for (let worker of data) {
            if (worker.role === 'contractor') {
              this.contractorWorkers.push(worker);
            } else {
              this.studioWorkers.push(worker);
            }
          }
        },
        error => console.error(error),
        () => this.isLoading = false
      );
    this.accessService.getAccountInvitationList()
      .subscribe(
        (data) => { this.invitations = data; },
        error => console.error(error),
        () => this.isLoading = false
      );
  }

  removeInvitation(invitation: Invitation) {
    _.remove(this.invitations, {id: invitation.id});
  }

  openInvitationModal() {
    this.modal
      .open(InvitationModalComponent, overlayConfigFactory({invitation: {}}, InvitationModalWindowData))
      .then(dialogRef => {
        dialogRef.result
          .then(invitation => {
            this.invitations.push(invitation);
          })
          .catch(() => {});
      });
  }
}
