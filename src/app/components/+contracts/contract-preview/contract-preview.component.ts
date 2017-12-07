import { Contract } from '../../../models/contract';
import { ContractService } from '../../../services/contract/contract.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ModalService } from '../../../services/modal/modal.service';
import { SignatureService } from '../../../services/signature/signature.service';
import { Signature } from '../../../models/signature.model';
import { AccessService } from '../../../services/access/access.service';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-contract-preview',
  templateUrl: './contract-preview.component.html',
  styleUrls: [
    './contract-preview.component.scss'
  ]
})
export class ContractPreviewComponent {

  @Input() contract: Contract|any = {};
  @Input() classModifier: boolean = false;
  @Input() canSign = true;
  @Input() sign: Subject<any>;

  @Output() valid = new EventEmitter<boolean>();

  private contractPreview: string;
  private previewLoading: boolean;
  private componentRef;
  private signatures: Signature[];
  private workerSignature: Signature;
  private continueEnabled: boolean = false;
  private agreement = false;
  private currentSignature: Signature;
  private currentSignatureCompleted: boolean = false;

  constructor(private contractService: ContractService,
              private signatureService: SignatureService,
              private accessService: AccessService,
              private modalService: ModalService,
              private router: Router) {
  }

  ngOnChanges() {
    this.loadPreview();
  }

  // submit() {
  //   if (this.signing) {
  //     this.sign.next();
  //
  //   } else {
  //     this.router.navigate(['/contracts', this.contract.id]);
  //   }
  //   this.close();
  // }

  // close() {
  // this.modalService.hideModal();
  // jQuery('button.submit-button').prop('disabled', false);
  // }

  // public setComponentRef(ref) {
  //   this.componentRef = ref;
  // }


  loadPreview() {
    this.previewLoading = true;
    // this.signing = this.contract.status === 'sent';

    this.contractService.preview(this.contract.id)
      .subscribe(res => {
        this.contractPreview = res.contents;
        this.previewLoading = false;
      });
    Observable.zip(
      this.signatureService.getList({legal_document: this.contract.id}),
      this.contractService.mySignature(this.contract.id)
    )
      .subscribe(([signatureRes, mySignature]) => {

        let signatures = signatureRes.results.map(sig => {
          sig.selected = this.isCurrentSignature(mySignature, sig);
          if (sig.selected) {
            this.currentSignature = sig;
            this.currentSignatureCompleted = sig.completed;
          }
          return sig;
        });
        if (mySignature) {
          this.agreement = mySignature.completed;
        }

        this.signatures = signatures.filter(sig => !sig.worker);
        this.workerSignature = signatures.find(sig => !!sig.worker);
        this.updateValidity();

      });
  }

  updateValidity() {
    if (this.currentSignature && this.canSign) {
      setTimeout(() => {
        this.valid.emit(this.currentSignature.completed && this.agreement);
      }, 0);
    }

  }


  onSigned(signature: Signature) {
    this.continueEnabled = signature.completed;
    this.updateValidity();
  }

  isCurrentSignature(mySignature, signature) {

    if (mySignature) {
      return this.canSign && signature.id === mySignature.id;
    }
  }

}
