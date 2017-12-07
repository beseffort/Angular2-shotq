import { DialogRef, ModalComponent, Overlay } from 'single-angular-modal';
import { Component, ViewContainerRef } from '@angular/core';
import { Contract } from '../../../../models/contract';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { StickyButtonsModalContext } from '../../../sq-modal/base-modal-components/sticky-buttons/sticky-buttons.context';
import { StickyButton } from '../../../sq-modal/base-modal-components/sticky-buttons/button.model';
import { ContractService } from '../../../../services/contract/contract.service';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';

export class ContractPreviewModalContext extends StickyButtonsModalContext {
  showFooter = true;
  canSign: boolean = true;
  contract?: Contract;
  contractId?: number;
}

@Component({
  selector: 'app-contract-preview-modal',
  templateUrl: './contract-preview-modal.component.html',
})
export class ContractPreviewModalComponent implements ModalComponent<ContractPreviewModalContext> {
  sign = new Subject<any>();
  isLoading: boolean = false;

  private context: ContractPreviewModalContext;
  private contract: Contract;
  private valid = false;
  private editButton: StickyButton;


  constructor(public dialog: DialogRef<ContractPreviewModalContext>,
              public flash: FlashMessageService,
              private contractService: ContractService,
              private router: Router) {
    this.context = dialog.context;

    this.context.buttons = [
      {
        label: 'Cancel',
        action: this.cancel.bind(this),
        classes: '',
        disabled: false
      },
      {
        label: this.context.canSign ? 'Sign And Continue' : 'EDIT',
        action: this.edit.bind(this),
        classes: '',
        disabled: false
      },
    ];

    this.editButton = this.context.buttons[1];
  }

  ngOnInit() {
    if (!this.context.contract && this.context.contractId) {
      this.getContract();
    } else {
      this.contract = this.context.contract;
    }
  }

  getContract() {
    this.isLoading = true;
    this.contractService
      .get(this.context.contractId)
      .subscribe(
        (contract) => {
          this.contract = contract;
          this.isLoading = false;
        },
        (errors) => {
          console.error(errors);
          this.flash.error('Matched contract not found. Maybe it was deleted.');
        },
        () => { this.isLoading = false; }
      );
  }

  onValidChange(valid) {
    this.valid = valid;
    this.editButton.disabled = !(!this.context.canSign || this.context.canSign && valid);

  }

  cancel() {
    this.dialog.dismiss();
  }

  edit() {
    if (this.context.canSign) {
      this.dialog.close(true);
      this.sign.next();
    } else {
      this.dialog.dismiss();
      setTimeout(() => {
        this.router.navigate(['/contracts', this.contract.id]);
      }, 300);
    }
  }

}
