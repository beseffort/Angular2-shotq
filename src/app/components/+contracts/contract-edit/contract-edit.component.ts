import { Component, ViewContainerRef } from '@angular/core';
import { ContractService } from '../../../services/contract/contract.service';
import { ContractTemplateService } from '../../../services/contract-template';
import { ActivatedRoute, Router } from '@angular/router';
import { Contract } from '../../../models/contract';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';
import { TemplateVariable } from '../../../models/template-variable.model';
import { Subscription } from 'rxjs';
import {
  ContractPreviewModalComponent,
  ContractPreviewModalContext
} from '../contract-preview/contract-preview-modal/contract-preview-modal.component';
import { Overlay, overlayConfigFactory } from 'single-angular-modal';
import { StickyButtonsModal } from '../../sq-modal/base-modal-components/sticky-buttons/sticky-buttons-modal.service';


@Component({
  selector: 'app-contract-edit',
  templateUrl: './contract-edit.component.html',
  styleUrls: [
    './contract-edit.component.scss',
  ],
})
export class ContractEditComponent {

  contract: Contract;
  templateVariables: TemplateVariable[] = [];

  isLoading: boolean = false;

  contractSub$: Subscription;
  templateVarsSub$: Subscription;
  templateVarErrors = [];
  private contractContents: string = '';
  private currentError;
  private isDisabled: boolean;

  constructor(private contractService: ContractService,
              private contractTemplateService: ContractTemplateService,
              private router: Router,
              public modal: StickyButtonsModal,
              private overlay: Overlay,
              private vcRef: ViewContainerRef,
              private route: ActivatedRoute,
              private flash: FlashMessageService) {
    overlay.defaultViewContainer = vcRef;


  }

  ngOnInit() {
    this.isLoading = true;
    this.contractSub$ = this.route.params
      .switchMap((params: { id: string }) => this.contractService.get(parseInt(params.id, 10)))
      .map(ContractService.newObject)
      .subscribe((contract: Contract) => {
        this.contract = contract;
        if (!contract.isDraft && !contract.isPending && !contract.isSent) {
          this.router.navigate(['/contracts', contract.id, 'send']);
        }

        this.contractContents = this.contract.contents;
      }, error => {
        this.flash.error('Error getting contract');
      }, () => {
        this.isLoading = false;
      });
    this.contractTemplateService.variables().subscribe((result) => {
      this.templateVariables = result;
    });
  }

  ngOnDestroy() {


  }

  onContentsChange($event) {
    this.contract.contents = $event;
  }

  onTemplateVariableErrorsChange($event) {
    this.templateVarErrors = $event;
  }

  onTemplateVariablesChange(vars) {
    this.templateVariables = vars;
  }

  onSelectError(error) {
    this.currentError = error;
  }

  save() {
    this.contractService.save(this.contract)
      .subscribe((contract: Contract) => {
        let next = (<{ next: string }>this.route.snapshot.queryParams).next;
        if (next) {
          this.router.navigate([next]);
        } else {
          this.router.navigate(['/contracts', this.contract.id, 'send']);
        }
      });
  }

  cancel() {
    let back = (<{ back: string }>this.route.snapshot.queryParams).back;
    if (back) {
      this.router.navigate([back]);
    } else {
      this.router.navigate(['/contracts']);
    }
  }

  showPreview() {
    this.contractService.save(this.contract)
      .map(ContractService.newObject)
      .subscribe((contract: Contract) => {

        this.modal
          .open(ContractPreviewModalComponent,
            overlayConfigFactory({
              isBlocking: false,
              canSign: contract.isSent,
              contract: this.contract
            }, ContractPreviewModalContext)
          );
      });
  }
}
