import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Signature } from '../../../../models/signature.model';
import { SignatureService } from '../../../../services/signature/signature.service';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
@Component({
  selector: 'app-contract-signature',
  templateUrl: './contract-signature.component.html',
  styleUrls: [
    './contract-signature.component.scss'
  ]
})
export class ContractSignatureComponent {
  @Input() signature: Signature;
  @Input() selected: boolean = false;
  @Input() sign: Subject<any>;

  @Output() onChange = new EventEmitter<Signature>();
  @Output() onSigned = new EventEmitter<Signature>();
  editing = false;
  completed: boolean = false;
  selectingStyle = false;
  fontStyles = [
    'savoye',
    'snell',
    'brush'
  ];
  signSub$: Subscription;
  private signatureName: string;

  constructor(private signatureService: SignatureService) {

  }

  edit(e) {
    e.stopPropagation();

    this.selectingStyle = true;
  }

  ngOnChanges(changes) {
    if (changes.sign && changes.sign.firstChange && !!changes.sign.currentValue) {
      this.signSub$ = this.sign.subscribe(() => {
        this.save();
      });

    }
    this.signatureName = this.signature.worker ? `Photographer Signature (${this.signature.name})` : this.signature.name;
    this.completed = this.signature.completed;
  }

  clear(e) {
    e.stopPropagation();
    this.signature.completed = false;
    this.signature.sig_style = '';
    this.onChange.emit(this.signature);
    this.save();
  }

  onSignatureClick() {
    if (this.completed)
      return;

    if (this.selected) {
      this.editing = true;
      if (!this.signature.completed) {
        this.selectingStyle = true;
      }
    }
  }

  selectStyle(fontName) {
    this.selectingStyle = false;
    this.signature.sig_style = fontName;
    this.signature.completed = true;
    this.onChange.emit(this.signature);
  }

  save() {
    this.signatureService.save(this.signature)
      .subscribe(res => {
        Object.assign(this.signature, res);
        this.onSigned.emit(this.signature);
      });
  }

  onClickOutside() {
    this.editing = false;
    this.selectingStyle = false;
  }
}

