import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';

import * as _ from 'lodash';

import { TemplateVariable } from '../../../../models/template-variable.model';
import { TemplateVariableService } from '../../../../services/template-variable/template-variable.service';
import { SignalService } from '../../../../services/signal-service/signal.service';
import { GroupByPipe } from '../../../../pipes/group-by/group-by.pipe';


@Component({
  selector: 'app-template-variables',
  templateUrl: './template-variables.component.html',
  styleUrls: ['./template-variables.component.scss'],

  providers: [
    TemplateVariableService,
    GroupByPipe
  ]
})
export class TemplateVariablesComponent implements OnChanges {

  @Input() variables: TemplateVariable[] = [];
  @Input() errors: TemplateVariable[] = [];
  @Input() hideErrors: boolean = false;
  @Input() showCloseIcon: boolean = false;

  @Output() variablesChange: EventEmitter<TemplateVariable[]> = new EventEmitter<TemplateVariable[]>();
  @Output() onErrorSelect: EventEmitter<TemplateVariable> = new EventEmitter<TemplateVariable>();
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();

  currentError: any = null;
  variableGroups: Object = {};

  seartTerm: string = '';
  _: any = _;

  constructor(private templateVariableService: TemplateVariableService,
              private groupByPipe: GroupByPipe,
              private signal: SignalService) {

  }

  ngAfterViewInit() {
    this.signal.stream
      .filter(message => message.group === 'templateVar' && message.type === 'selectError')
      .map(message => message.instance)
      .subscribe(varKey => {
        let error = this.errors.find(item => item.key === varKey);
        if (error) {
          this.currentError = error;
        }
      });
    this.signal.stream
      .filter(message => message.group === 'templateVar' && message.type === 'dismissError')
      .map(message => message.instance)
      .subscribe(this.removeError.bind(this));
  }

  removeError(varKey) {
    let errorIndex = this.errors.findIndex(item => item.key === varKey);
    if (errorIndex > -1) {
      this.errors.splice(errorIndex, 1);
      this.syncCurrentError();
    }
  }

  ngOnChanges(changes) {
    if (changes.variables) {
      let data = _.cloneDeep(this.variables);
      this.variableGroups = this.groupByPipe.transform(data, 'group');
    }

    this.syncCurrentError();
  }

  syncCurrentError() {
    let i = 0;
    this.errors.map((item: any) => {
      item.index = i;
      i++;
    });
    if (this.errors.length) {
      if (!this.currentError) {
        this.selectError(this.errors[0]);
      } else {
        let newErrPos = this.errors.find(item => item.key === this.currentError.key);
        this.selectError(newErrPos ? newErrPos : this.errors[0]);
      }
    } else {
      this.currentError = null;
    }
  }

  selectError(error) {
    this.currentError = error;
    this.onErrorSelect.emit(this.currentError);
    this.signal.send({
      group: 'templateVar',
      type: 'select',
      instance: error
    });

  }

  replaceVar() {
    this.signal.send({
      group: 'templateVar',
      type: 'replaceError',
      instance: this.currentError
    });
    this.removeError(this.currentError.key);
  }

  dismissVariable() {
    this.signal.send({
      group: 'templateVar',
      type: 'dismissError',
      instance: this.currentError.key,
    });
  }

  step(way: number) {
    if (this.currentError) {
      let canGoRight = this.currentError.index < this.errors.length - 1;
      let canGoLeft = this.currentError.index >= 1;
      if ((way < 0 && canGoLeft) || (way > 0 && canGoRight)) {
        this.selectError(this.errors[this.currentError.index + way]);
      }
    }

  }

  onDblClickVar(variable) {
    this.signal.send({
      group: 'templateVar',
      type: 'addVariable',
      instance: variable,
    });
  }

  onCloseClick() {
    this.seartTerm = '';
    this.onClose.emit();
  }


}
