import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { isUndefined } from 'util';


export type step = {
  name: string;
  title: string;
  valid: boolean;
  enabled?: boolean;
  validate?: () => boolean;
  activate?: () => void;
  finalize?: (nextStep?: step) => boolean;
  _index?: number;
  options?: any;
};

@Component({
  selector: 'app-step-indicator',
  templateUrl: './step-indicator.component.html',
  styleUrls: ['./step-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepIndicatorComponent {
  @Input() initialStepIndex = 0;
  @Input() steps: step[] = [];
  @Input() nextStep: Subject<step | any>;
  @Input() styleType = 'booking';
  @Input() canGoNextIfValid = true;

  @Output() stepChanged = new EventEmitter<step>();
  @Output() onFinish = new EventEmitter<any>();

  _steps: step[] = [];
  nextStepSub$: Subscription;
  currentStep: step;

  stepTo(nextStep: step) {
    if (!this.currentStep || this.currentStep.name !== nextStep.name) {
      let stepFinalized = this.currentStep ? this._finalizeStep(this.currentStep, nextStep) : true;
      if (stepFinalized) {
        this._activateStep(nextStep);
      }
    }
  }

  _activateStep(step) {
    this.currentStep = step;
    this.stepChanged.emit(step);

    if (step.activate) {
      step.activate();
    }
  }

  _finalizeStep(step, nextStep?) {
    if (step.finalize) {
      return step.finalize(nextStep);
    }
    return true;
  }

  onStepClick(step) {
    if (this.canActivateStep(step)) {
      this.stepTo(step);
    }
  }

  canActivateStep(step) {
    if (!this.canGoNextIfValid && step._index > this.currentStep._index) {
      return false;
    }

    return this._steps
      .slice(0, step._index)
      .every(step_ => step_.valid);
  }

  ngOnChanges(changes) {
    let i = 0;

    this._steps = this.steps.filter(step => isUndefined(step.enabled) ||  step.enabled);

    this._steps.forEach(step => {
      step._index = i;
      i++;
    });


    if (this.nextStep && !this.nextStepSub$) {
      this.nextStepSub$ = this.nextStep
        .debounceTime(400)
        .subscribe((step: step) => {
          if (step) {
            this.stepTo(step);
          } else {
            this.stepNext();
          }
        });
    }
    if (!this.currentStep) {
      this.stepTo(this._steps[this.initialStepIndex]);
    }
  }

  ngOnDestroy() {
    if (this.nextStepSub$) {
      this.nextStepSub$.unsubscribe();
    }
  }

  stepNext() {
    if (this.currentStep._index < this._steps.length - 1) {
      let nextIndex = this.currentStep._index + 1;
      this.stepTo(this._steps[nextIndex]);
    } else {
      this._finalizeStep(this.currentStep);
      this.onFinish.emit();
    }

  }
}
