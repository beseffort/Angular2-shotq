import * as _ from 'lodash';
import { Component, Input, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import {
  Proposal, EXPIRATION_TYPE_CHOICES, EXPIRATION_TYPE_X_DAYS,
  EXPIRATION_TYPE_NEVER_EXPIRE
} from '../../../../models/proposal';
import { ProposalService } from '../../../../services/proposal';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-proposal-expiration',
  templateUrl: './proposal-expiration.component.html',
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProposalExpirationComponent {
  @Input() proposal: Proposal;
  @Output() onChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() valid = new EventEmitter<boolean>();

  private expireTypes = EXPIRATION_TYPE_CHOICES.slice(0, 2);
  private expireForm: FormGroup;
  private formChanges$: Subscription;

  constructor(private formBuilder: FormBuilder,
              private flash: FlashMessageService,
              private proposalService: ProposalService) {
    this.expireForm = this.formBuilder.group({
      expire_at: '',
      expire_days: [1, [this.checkExpireDays]],
      expire_type: EXPIRATION_TYPE_X_DAYS,
      never_expire: false,
    });
  }


  ngOnChanges(changes) {
    if (changes.proposal.firstChange)
      this.patchForm();
  }

  ngOnDestroy() {
    this.formChanges$.unsubscribe();
  }


  patchForm() {
    if (this.formChanges$) {
      this.formChanges$.unsubscribe();
    }
    this.expireForm.patchValue(this.transformModelToForm(this.proposal));
    this.valid.emit(this.expireForm.valid);
    this.formChanges$ = this.expireForm.valueChanges
      .debounceTime(200)
      .subscribe(this.save.bind(this));
  }

  transformModelToForm(proposal: Proposal) {
    let neverExpire = proposal.expire_type === EXPIRATION_TYPE_NEVER_EXPIRE;
    return Object.assign({}, proposal, {
      expire_type: neverExpire ? EXPIRATION_TYPE_X_DAYS : proposal.expire_type,
      never_expire: neverExpire
    });
  }

  transformFormToModel(formData) {
    let neverExpire = formData.never_expire;
    return Object.assign({}, formData, {
      expire_type: neverExpire ? EXPIRATION_TYPE_NEVER_EXPIRE : formData.expire_type,
    });
  }

  save(formData) {
    if (this.expireForm.valid) {
      this.onChange.emit(this.transformFormToModel(formData));
    }
    this.valid.emit(this.expireForm.valid);
  }

  private checkExpireDays(fieldControl: FormControl) {
    return fieldControl.value && fieldControl.value > 0 ? null : {invalidExpireDays: true};
  }

}
