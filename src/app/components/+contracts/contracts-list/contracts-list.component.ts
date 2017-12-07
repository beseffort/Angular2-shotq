import { GeneralFunctionsService } from '../../../services/general-functions/general-functions.service';
import { OnInit, Component, ViewContainerRef } from '@angular/core';
import { BreadcrumbService } from '../../shared/breadcrumb/components/breadcrumb.service';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';
import { ModalService } from '../../../services/modal/modal.service';
import { Router } from '@angular/router';
import { Contract } from '../../../models/contract';
import { ContractService } from '../../../services/contract/contract.service';
import { FilterParam } from '../filter-panel/filter-panel.component';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Modal, Overlay, overlayConfigFactory } from 'single-angular-modal';
import {
  ContractPreviewModalComponent,
  ContractPreviewModalContext
} from '../contract-preview';
import { StickyButtonsModal } from '../../sq-modal/base-modal-components/sticky-buttons/sticky-buttons-modal.service';
import { Observable } from 'rxjs/Observable';
import { ContractAddModalContext, ContractsAddModalComponent } from '../contracts-add/contracts-add.component';

type viewType = 'list' | 'grid';

export const ContractActions = {
  enabled: [
    {
      id: 'contract-archive',
      name: 'Archive',
      icon: 'icon-archive',
      title: 'Archive'
    },
    {
      id: 'contract-preview',
      name: 'Preview Contract',
      icon: 'icon-open-eye',
      title: 'Preview'
    },
    {
      id: 'contract-edit',
      name: 'Edit Contract',
      icon: 'icon-edit',
      title: 'Edit'
    },
  ],
};


@Component({
  selector: 'app-contracts',
  templateUrl: './contracts-list.component.html',
  styleUrls: ['./contracts-list.component.scss'],
  providers: [GeneralFunctionsService, ContractService]

})
export class ContractsListComponent implements OnInit {

  private alertify = require('../../../assets/theme/assets/vendor/alertify-js/alertify.js');

  private isLoading: boolean = false;
  private contractsSub$: Subscription;
  private searchSub$: Subscription;
  private contractActions = ContractActions;
  private contracts: Contract[];
  private viewType: viewType = 'list';

  private paginator = {
    totalItems: 100,
    currentPage: 1,
    perPage: 0,
  };

  private hasPages: boolean = false;

  private icons = {
    nameUp: 'icon-up-arrow',
    nameDown: 'icon-down-arrow',
    dateUp: 'icon fa-sort-amount-asc',
    dateDown: 'icon fa-sort-amount-desc',
    emailUp: 'icon-up-arrow',
    emailDown: 'icon-down-arrow'
  };

  // sort flags
  private sort = {
    sortedBy: 'name',
    nameAsc: true,
    dateCreatedAsc: true,
    emailAsc: true
  };

  private actionsBar = {
    color: 'gray',
    enabled: false,
    deleteBtn: {
      message: 'Are you sure that you want to do this?',
    }
  };

  private filterParams: FilterParam[] = [
    {
      key: 'status',
      title: 'Status',
      choices: [
        {key: null, title: 'All', selected: true},
        {key: 'draft', title: 'Draft'},
        {key: 'sent', title: 'Sent'},
        {key: 'pending', title: 'Pending'},
        {key: 'signed', title: 'Signed'},
        {key: 'archived', title: 'Archived'},
      ]
    }, {
      key: 'client_type',
      title: 'Client type',
      choices: [
        {key: null, title: 'All', selected: true},
        {key: 'client', title: 'Client'},
        {key: 'vendor', title: 'Vendor'},

      ]
    }, {
      key: 'job_type',
      title: 'job type',
      choices: [
        {key: null, title: 'All', selected: true},
        {key: 'wedding', title: 'Wedding'},
        {key: 'mini_session', title: 'Mini Session'},
        {key: 'portrait', title: 'Portrait'},
        {key: 'pet_portrait', title: 'Pet Portrait'},
        {key: 'headshots', title: 'Headshots'},
      ]
    }
  ];
  private queryFilterParams = {};
  private queryFilterParamsEmpty = true;

  private selectAllChecked;
  private contractsChecked: Contract[] = [];
  private searchTerm: string = '';
  private searchTermControl = new FormControl();
  private modalSub$: Subscription;

  constructor(private breadcrumbService: BreadcrumbService,
              private contractService: ContractService,
              private flash: FlashMessageService,
              private modalService: ModalService,
              public modal: Modal,
              public buttonsModal: StickyButtonsModal,
              private generalFunctions: GeneralFunctionsService,
              private router: Router,
              vcRef: ViewContainerRef,
              overlay: Overlay) {
    overlay.defaultViewContainer = vcRef;

  }

  ngOnInit() {
    this.getContracts();
    this.alertify.theme('bootstrap-shootq');
    this.alertify.okBtn('OK');

    this.searchSub$ = this.searchTermControl.valueChanges
      .distinctUntilChanged()
      .debounceTime(400)
      .subscribe(() => {
        this.paginator.currentPage = 1;
        this.getContracts();
      });

    this.modalSub$ = this.modalService.onHide.subscribe(res => {
      this.getContracts();
    });
  }

  ngOnDestroy() {
    this.searchSub$.unsubscribe();
    this.contractsSub$.unsubscribe();
    this.modalSub$.unsubscribe();
  }

  createContract() {
    this.modal
      .open(ContractsAddModalComponent,
        overlayConfigFactory({}, ContractAddModalContext))
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            this.getContracts();
            // Catching close event with result data from modal
            // console.log(result)
          })
          .catch(() => {
            // Catching dismiss event with no results
            // console.log('rejected')
          });
      });
  }

  openContract(contract) {

    // if (contract.status === 'sent') {
    this.router.navigate(['/contracts', contract.id, 'send']);

    // } else {
    //   this.router.navigate(['/contracts', contract.id]);
    //
    // }
  }

  isFiltersEmpty() {
    return Object.keys(this.queryFilterParams).length === 0 && this.queryFilterParams.constructor === Object;
  }

  getSearchParams() {
    let params = {
      ordering: this.generalFunctions.getSortOrderParam(this.sort).split(/=/g)[1],
      search: this.searchTerm
    };

    return Object.assign({},
      this.generalFunctions.getPaginatorObjectParam(this.paginator),
      params,
      this.queryFilterParams
    );
  }

  private getContracts() {

    if (this.contractsSub$) {
      this.contractsSub$.unsubscribe();
    }
    this.isLoading = true;

    this.contractsSub$ = this.contractService.getList(this.getSearchParams())
      .subscribe(resp => {
          this.contracts = resp.results;
          this.paginator.totalItems = resp.count;
          this.queryFilterParamsEmpty = this.isFiltersEmpty();
        }, err => {
          console.error(err);
        }, () => this.isLoading = false
      );
  }

  private filterChanged(params) {
    this.paginator.currentPage = 1;
    this.queryFilterParams = params;
    this.getContracts();
  }

  private toggleView(view: viewType) {
    this.viewType = view;
  }


  /**
   * Returns the proper sort icon name to display
   * @return {string} [description]
   */
  private getSortNameIcon(): string {
    if (this.sort.nameAsc) {
      return this.icons.nameUp;
    } else {
      return this.icons.nameDown;
    }
  }

  /**
   * return if a contract is checked
   * @param contract
   */
  private isChecked(contract) {
    return (this.contractsChecked.indexOf(contract.id) !== -1);
  }


  /**
   * toogle enabled/disabled status of the action button bar
   */
  private toggleActionButtonBar() {
    if (this.contractsChecked.length > 0) {
      this.actionsBar.enabled = true;
    } else {
      this.actionsBar.enabled = false;
    }
  }


  /**
   * Toogle the checked status of a contract
   * @param {[Contact]}
   */
  private toggleCheckContract(contract) {
    if (!this.isChecked(contract)) {
      this.checkContract(contract);
    } else {
      this.uncheckContract(contract);
    }
    this.toggleActionButtonBar();
  }

  /**
   * Uncheck a contract
   * @param {[type]}
   */
  private uncheckContract(contract) {
    let i = this.contractsChecked.indexOf(contract.id);
    this.contractsChecked.splice(i, 1);
    this.selectAllChecked = false;
  }

  /**
   * Check a contract
   * @param {[type]}
   */
  private checkContract(contract) {
    this.contractsChecked.push(contract.id);
    if (this.contractsChecked.length === this.contracts.length) {
      this.selectAllChecked = true;
    }
  }

  /**
   * Check all the contracts
   */
  private checkAll() {
    this.selectAllChecked = !this.selectAllChecked;
    this.contractsChecked.splice(0);
    if (this.selectAllChecked) {
      for (let c of this.contracts) {
        this.checkContract(c);
      }
    }
    this.toggleActionButtonBar();
  }

  /**
   * Returns the proper sort icon name to display
   * @return {string} [description]
   */
  private getSortEmailIcon(): string {
    if (this.sort.emailAsc) {
      return this.icons.emailUp;
    } else {
      return this.icons.emailDown;
    }
  }

  /**
   * Function that handele contract list single action.
   *
   * @param {Object} action  The object with available actions to handle.
   * @param {Object} contract The object with contract information.
   */
  private singleContractAction(action, contract) {
    switch (action.id) {

      case 'contract-archive':
        this.contractArchive(contract);
        break;

      case 'contract-preview':
        this.buttonsModal
          .open(ContractPreviewModalComponent,
            overlayConfigFactory({
              isBlocking: false,
              canSign: contract.status === 'sent',
              contract: contract
            }, ContractPreviewModalContext)
          );
        break;

      case 'contract-edit':
        if (['draft', 'pending', 'sent'].indexOf(contract.status) === -1) {
          this.flash.error(`Cannot edit contract in ${contract.status} status`);
        } else {
          this.router.navigate(['/contracts', contract.id]);
        }
        break;

      default:
        this.flash.error('Unhandled action, see singleContractAction method');
    }
  }

  /**
   * Update the contract list when a change page event is emited by pagination component
   * @param {[type]} event [description]
   */
  private handlePageChange(event) {
    // update paginator
    this.paginator.currentPage = event.page;
    this.paginator.perPage = event.perPage;
    this.hasPages = (this.paginator.perPage !== 0 && this.paginator.totalItems > this.paginator.perPage);
    this.getContracts();
  }

  private contractArchive(contract: any) {
    // FIXME: dumb but fast. need django-fsm?
    contract.status = 'archived';
    this.contractService
      .save(contract)
      .first()
      .subscribe();
  }
}
