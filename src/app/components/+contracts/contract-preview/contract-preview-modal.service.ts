import { Injectable } from '@angular/core';
import { Modal } from 'single-angular-modal/plugins/bootstrap';
import {
  ContractPreviewModalComponent,
  ContractPreviewModalContext
} from './contract-preview-modal/contract-preview-modal.component';
import { overlayConfigFactory } from 'single-angular-modal';

declare let require: (any);


@Injectable()
export class ContractPreviewModalService {
  private modalInstance = null;

  constructor(public modal: Modal,
) {

  }

  public setContractToModal(contract, options?) {
    options = options || {};
    this.modalInstance.classModifier = true;
    this.modalInstance.contract = contract;
    this.modalInstance.loadPreview();
    this.modalInstance.canSubmit = contract.status === 'draft';
    // if (options.signing)
    //   this.modalInstance.signing = true;
  }

  public openModal(parentCmp, contract, options?) {

    this.modal
      .open(ContractPreviewModalComponent,
        overlayConfigFactory({
          contract: contract
        }, ContractPreviewModalContext))
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            // Catching close event with result data from modal
            // console.log(result)
          })
          .catch(() => {
            // Catching dismiss event with no results
            // console.log('rejected')
          });
      });


    // // this.modalService.setModalContent(ContractPreviewModule, '', 'contract-preview-modal');
    // this.modalService.setModalFooterBar(options.confirmText || 'EDIT', true, options);
    //
    // if (location.hash.search('modalOpen') > -1) {
    //   location.hash = location.hash.replace('?modalOpen', '');
    // }
    //
    // this.modalService.templateChange
    //   .first()
    //   .subscribe(data => {
    //     this.modalInstance = data.instance;
    //     this.modalInstance.setComponentRef(parentCmp);
    //     this.setContractToModal(contract, options);
    //   });
    // this.modalService.showModal(true, true);

  }
}
