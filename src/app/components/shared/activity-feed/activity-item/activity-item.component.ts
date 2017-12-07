import { Component, Input } from '@angular/core';

import { overlayConfigFactory } from 'single-angular-modal';
import * as _ from 'lodash';

import {
  ContractPreviewModalComponent,
  ContractPreviewModalContext
} from '../../../+contracts/contract-preview/contract-preview-modal/contract-preview-modal.component';
import { StickyButtonsModal } from '../../../sq-modal/base-modal-components/sticky-buttons/sticky-buttons-modal.service';

@Component({
  selector: 'activity-item',
  templateUrl: 'activity-item.component.html',
  styleUrls: ['./../activity-feed.component.scss']
})
export class ActivityItemComponent {
  @Input() item: any;

  constructor(public buttonsModal: StickyButtonsModal) {
  }

  public ngOnInit() {
  }

  previewContract(contractId, canSign: boolean = true) {
    this.buttonsModal
      .open(ContractPreviewModalComponent,
        overlayConfigFactory({
          isBlocking: false,
          canSign: canSign,
          showFooter: canSign,
          contractId: contractId
        }, ContractPreviewModalContext)
      );
  }

  getIcon(action) {
    let iconClass = 'icon-document-text';

    if (_.includes(action, 'invoice') || _.includes(action, 'payment'))
      return 'icon-money-dollar-cash';

    if (_.includes(action, 'contract'))
      return 'icon-document-text icon-document-text__blue';

    if (_.includes(action, 'job'))
      return 'icon-document-text';

    if (_.includes(action, 'proposal'))
      return 'icon-document-text icon-document-text__yellow';

    if (_.includes(action, 'event'))
      return 'fa fa-calendar';

    return iconClass;
  }
}
