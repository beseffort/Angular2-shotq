import { Component } from '@angular/core';

import { BSModalContext } from 'single-angular-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from 'single-angular-modal';
import { Modal } from 'single-angular-modal/plugins/bootstrap';

import { GeneralFunctionsService } from '../../../../services/general-functions';
import { FlashMessageService }      from '../../../../services/flash-message';


export class ImportCSVStepFourWindowData extends BSModalContext {
  public contactsCreated: number;
}


@Component({
    selector: 'step-four-modal',
    templateUrl: './step-four-modal.component.html',
    styleUrls: ['./step-four-modal.component.scss'],
    providers: [GeneralFunctionsService, FlashMessageService]
})
export class ImportCSVStepFourModalComponent implements ModalComponent<ImportCSVStepFourWindowData>  {
  contactsCreated: number;

  constructor(public modal: Modal,
              public dialog: DialogRef<ImportCSVStepFourWindowData>) {
    this.dialog.context.dialogClass = 'modal-dialog import-csv-result-modal';
  }

  ngOnInit() {
    this.contactsCreated = this.dialog.context.contactsCreated;
  }

  close(data) {
    this.dialog.close(data);
  }

  dismiss() {
    this.dialog.dismiss();
  }
}
