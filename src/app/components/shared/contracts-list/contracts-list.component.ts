import { Component, Input, OnInit, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import * as _ from 'lodash';
import { Modal } from 'single-angular-modal/plugins/bootstrap';
import { Overlay, overlayConfigFactory } from 'single-angular-modal';

import { ContractService } from '../../../services/contract/contract.service';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';
import {
  QuickContractComponent,
  QuickContractWindowData
} from '../../top-navbar/quick-contract/quick-contract.component';
import {
  ContractPreviewModalComponent,
  ContractPreviewModalContext
} from '../../+contracts/contract-preview/contract-preview-modal/contract-preview-modal.component';
import { Contract } from '../../../models/contract';
import { StickyButtonsModal } from '../../sq-modal/base-modal-components/sticky-buttons/sticky-buttons-modal.service';


@Component({
  selector: 'injected-contracts-list',
  templateUrl: 'contracts-list.component.html',
  styleUrls: ['contracts-list.component.scss']
})
export class InjectedContractsListComponent implements OnInit {
  @Input() query: any = {};
  @Input() canAdd: boolean = true;

  public contracts: Contract[] = [];

  public isLoading: boolean = false;
  public isArchived: boolean = false;

  public contractActions = [
    {
      id: 'contract-archive',
      name: 'Archive',
      icon: 'icon-archive',
      title: 'Archive',
      active: (contract) => !_.includes(
        [Contract.STATUS_SIGNED, Contract.STATUS_ARCHIVED, Contract.STATUS_PENDING],
        contract.status
      )
    },
    {
      id: 'contract-preview',
      name: 'Preview Contract',
      icon: 'icon-open-eye',
      title: 'Preview',
      active: (contract) => true
    },
    {
      id: 'contract-edit',
      name: 'Edit Contract',
      icon: 'icon-edit',
      title: 'Edit',
      active: (contract) => !_.includes([Contract.STATUS_SIGNED, Contract.STATUS_ARCHIVED], contract.status)
    }
  ];
  private currentUrl: string;

  constructor(
    public contractService: ContractService,
    public flash: FlashMessageService,
    public modal: Modal,
    public buttonsModal: StickyButtonsModal,
    private router: Router,
    private overlay: Overlay,
    private vcRef: ViewContainerRef,
    private route: ActivatedRoute
  ) {
    overlay.defaultViewContainer = vcRef;
  }

  public ngOnInit() {
    this.loadContracts();
    this.currentUrl = this.router.url;
  }

  toggleView() {
    this.isArchived = !this.isArchived;
    this.loadContracts();
  }

  getFilter() {
    let filter = _.cloneDeep(this.query);
    if (_.has(filter, 'job') && _.isObject(filter.job)) {
      filter.job = this.query.job.id;
    }
    if (this.isArchived)
      filter['status'] = Contract.STATUS_ARCHIVED;
    else
      filter['status!'] = Contract.STATUS_ARCHIVED;

    return filter;
  }

  loadContracts() {
    let filter = this.getFilter();

    this.isLoading = true;
    this.contractService
      .getList(filter)
      .subscribe(
        (result) => {
          this.contracts = result.results;
          this.contracts.map((contract) => {
            contract['actions'] = this.getContractActions(contract);
          });
        },
        (err) => {
          console.error(err);
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  update(proposal, data) {
    this.isLoading = true;
    this.contractService
      .partialUpdate(proposal.id, data)
      .subscribe(
        () => {
          this.flash.success('Contract is successfully updated.');
          this.loadContracts();
        },
        (error) => {
          console.error(JSON.stringify(error));
          this.flash.error('Error while updating contract.');
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  newContract() {
    let data = {};
    if (_.has(this.query, 'job')) {
      data['job'] = this.query.job;
    }
    this.modal
      .open(QuickContractComponent,
        overlayConfigFactory(data, QuickContractWindowData))
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            this.loadContracts();
          })
          .catch(() => {
          });
      });
  }

  getContractActions(contract: Contract) {
    return _.filter(this.contractActions, (action) => { return action.active(contract); });
  }

  previewContract(contract) {
    this.buttonsModal
      .open(ContractPreviewModalComponent,
        overlayConfigFactory({
          isBlocking: false,
          canSign: true,
          contract: contract
        }, ContractPreviewModalContext)
      );
  }

  confirmArchive(contract: Contract) {
    this.modal
      .confirm()
      .isBlocking(true)
      .showClose(false)
      .title(`Archive ${contract.title}?`)
      .dialogClass('modal-dialog modal-confirm')
      .body(`Are you sure you want to archive ${contract.title}?`)
      .okBtn('Archive')
      .okBtnClass('btn btn_xs btn_red pull-right')
      .cancelBtnClass('btn btn_xs btn_transparent')
      .open()
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            this.update(contract, {status: Contract.STATUS_ARCHIVED});
          })
          .catch(() => {});
      });
  }

  singleAction(action, contract: Contract) {
    switch (action.id) {
      case 'contract-edit':
        this.router.navigate(
          ['/contracts', contract.id],
          {queryParams: {next: this.currentUrl, back: this.currentUrl}});
        break;

      case 'contract-archive':
        this.confirmArchive(contract);
        break;

      case 'contract-preview':
        this.previewContract(contract);
        break;

      default:
        break;
    }
  }

}
