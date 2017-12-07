import {
  Component, OnInit, OnChanges,
  Input, SimpleChanges, Output,
  EventEmitter
} from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Proposal } from '../../../../models/proposal';
import { PAYMENT_PROVIDERS } from '../../../../models/merchant-account';

import { ProposalSettingTemplate } from '../../../../models/proposal-setting-template';
import { ProposalSettingTemplatesService } from '../../../../services/proposal-setting-templates';


@Component({
  selector: 'proposal-setting-templates',
  templateUrl: './proposal-setting-templates.component.html'
})
export class ProposalSettingTemplatesComponent implements OnChanges {
  @Input() proposal: Proposal;
  @Input() templates: ProposalSettingTemplate[] = [];
  @Output() onApply: EventEmitter<number> = new EventEmitter<number>();
  @Output() onSelected: EventEmitter<ProposalSettingTemplate> = new EventEmitter<ProposalSettingTemplate>();
  @Output() onSwitchToCustom: EventEmitter<any> = new EventEmitter<any>();

  form: FormGroup;
  selectedTemplate: ProposalSettingTemplate;
  paymentProviders = PAYMENT_PROVIDERS;
  setting: number;

  constructor() {
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['templates'] && changes['templates'].currentValue.length) {
      this.setting = this.templates[0].id;
    }
  }

  applyAndEdit(event: MouseEvent, tab: number) {
    event.preventDefault();
    event.stopPropagation();
    this.onApply.emit(tab);
  }

  onSelectSettings(settings) {
    this.selectedTemplate = settings;
    this.onSelected.emit(this.selectedTemplate);
  }
}
