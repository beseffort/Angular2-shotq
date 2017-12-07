import { Component, Input, Output, EventEmitter, ViewContainerRef } from '@angular/core';
import { Proposal } from '../../../../models/proposal';
import { ContractService } from '../../../../services/contract/contract.service';
import { Contract } from '../../../../models/contract';
import { Subscription } from 'rxjs';
import {
  ContractPreviewModalComponent,
  ContractPreviewModalContext
} from '../../../+contracts/contract-preview/contract-preview-modal/contract-preview-modal.component';
import { Modal, Overlay, overlayConfigFactory } from 'single-angular-modal';
import { StickyButtonsModal } from '../../../sq-modal/base-modal-components/sticky-buttons/sticky-buttons-modal.service';
@Component({
  selector: 'app-booking-sign',
  templateUrl: './booking-sign.component.html',
  styleUrls: [
    './booking-sign.component.scss'
  ]
})
export class BookingSignComponent {
  @Input() proposal: Proposal;
  @Output() onSign = new EventEmitter<any>();
  private contract: Contract;

  constructor(public buttonsModal: StickyButtonsModal,
              private overlay: Overlay,
              private vcRef: ViewContainerRef,
              private contractService: ContractService) {
        overlay.defaultViewContainer = vcRef;
  }

  ngOnInit() {
    this.sign();
  }

  ngOnChanges() {
    this.contract = this.proposal.contract_data;
  }

  ngOnDestroy() {
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
        this.onSign.emit();
      }, () => {
      });
    });
  }
}
