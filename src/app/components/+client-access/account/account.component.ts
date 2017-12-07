import { Component, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { LegalDocumentService } from '../../../services/client-access/legal-document/legal-document.service';
import { GeneralFunctionsService } from '../../../services/general-functions';
import { AccessService } from '../../../services/access/access.service';
import { Overlay, overlayConfigFactory } from 'single-angular-modal';
import { Modal } from 'single-angular-modal/plugins/bootstrap';
import { ClientUserEditComponent, ClientUserWindowData } from './client-user-edit';
import {
  ContractPreviewModalComponent,
  ContractPreviewModalContext
} from '../../+contracts/contract-preview/contract-preview-modal/contract-preview-modal.component';
import { StickyButtonsModal } from '../../sq-modal/base-modal-components/sticky-buttons/sticky-buttons-modal.service';


@Component({
  selector: 'account',
  templateUrl: 'account.component.html',
  styleUrls: ['account.component.scss'],
  providers: [AccessService, LegalDocumentService, GeneralFunctionsService]
})
export class AccountComponent {
  private isContractsLoading: boolean = false;
  private isUserInfoLoading: boolean = false;
  private jobId: number;
  private userInfo: any;
  private contractsInfo: Array<any> = [];

  constructor(public modal: Modal,
              public buttonsModal: StickyButtonsModal,
              private accessService: AccessService,
              private legalDocumentService: LegalDocumentService,
              private generalFunctions: GeneralFunctionsService,
              private route: ActivatedRoute,
              overlay: Overlay,
              vcRef: ViewContainerRef) {
    overlay.defaultViewContainer = vcRef;
  }

  ngOnInit() {
    /* Get account information */
    this.getUserInfo();

    this.route.parent.params.subscribe((params) => {
      this.jobId = +params['id'];
      this.getContractsInfo();
    });
  }

  /**
   * Function to get primary contact (External Owner)
   */
  public getUserInfo() {
    this.isUserInfoLoading = true;
    this.accessService
      .getClientShareContact()
      .subscribe(
        response => {
          this.userInfo = response.contact_data;
          this.userInfo.full_name = this.generalFunctions.getContactFullName(this.userInfo);
        },
        err => {
          console.error(err);
          this.isUserInfoLoading = false;
        },
        () => {
          this.isUserInfoLoading = false;
        }
      );
  }

  /**
   * Function to get contracts associated to specific job.
   */
  public getContractsInfo() {
    this.isContractsLoading = true;
    this.legalDocumentService
      .getContractsInfoByJob(this.jobId)
      .subscribe(
        response => {
          this.contractsInfo = response.results;
        },
        err => {
          console.error(err);
          this.isContractsLoading = false;
        },
        () => {
          this.isContractsLoading = false;
        }
      );
  }

  public openContract(contract) {

    this.buttonsModal
      .open(ContractPreviewModalComponent,
        overlayConfigFactory({
          isBlocking: false,
          showFooter: false,
          contract: contract
        }, ContractPreviewModalContext)
      );
  }

  /**
   * Open modal to edit information of the user.
   */
  public editContactInfo() {
    this.modal
      .open(ClientUserEditComponent, overlayConfigFactory({
        isBlocking: false,
        contactId: this.userInfo.id
      }, ClientUserWindowData))
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            this.userInfo = result;
            this.userInfo.full_name = this.generalFunctions.getContactFullName(this.userInfo);
          })
          .catch(() => {
          });
      });
  }
}
