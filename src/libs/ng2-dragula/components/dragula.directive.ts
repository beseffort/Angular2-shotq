import { Directive, Input, ElementRef, OnInit, OnChanges, SimpleChange } from '@angular/core';
import { DragulaService } from './dragula.provider';
import { dragula } from './dragula.class';
@Directive({selector: '[dragula]'})
export class DragulaDirective implements OnInit, OnChanges {
  @Input() public dragula: string;
  @Input() public dragulaModel: any;
  @Input() public dragulaOptions: any;
  private container: any;
  private drake: any;
  private el: ElementRef;
  private dragulaService: DragulaService;
  public constructor(el: ElementRef, dragulaService: DragulaService) {
    this.el = el;
    this.dragulaService = dragulaService;
    this.container = el.nativeElement;
  }
  public ngOnInit(): void {
    // console.log(this.bag);
    let bag = this.dragulaService.find(this.dragula);
    let addModelItemHandler = (handler) => {
      if (this.drake.modelItemHandlers) {
        this.drake.modelItemHandlers.push(handler);
      } else {
        this.drake.modelItemHandlers = [handler];
      }
    };
    let updateModelItemHandler = () => {
      if (this.dragulaOptions && this.dragulaOptions.modelItemModifier) {
        addModelItemHandler(this.dragulaOptions.modelItemModifier);
      } else {
        addModelItemHandler(item => item);
      }
    };
    let checkModel = () => {
      if (this.dragulaModel) {
        if (this.drake.models) {
          this.drake.models.push(this.dragulaModel);
        } else {
          this.drake.models = [this.dragulaModel];
        }
        updateModelItemHandler();
      }
    };
    if (bag) {
      this.drake = bag.drake;
      checkModel();
      this.drake.containers.push(this.container);
    } else {
      this.drake = dragula([this.container], Object.assign({}, this.dragulaOptions));
      checkModel();
      this.dragulaService.add(this.dragula, this.drake);
    }
  }
  public ngOnChanges(changes: {dragulaModel?: SimpleChange}): void {
    // console.log('dragula.directive: ngOnChanges');
    // console.log(changes);
    if (changes && changes.dragulaModel) {
      if (this.drake) {
        let modelItemHandler = item => item;
        if (this.dragulaOptions && this.dragulaOptions.modelItemModifier) {
          modelItemHandler = this.dragulaOptions.modelItemModifier;
        }
        if (this.drake.models) {
          let modelIndex = this.drake.models.indexOf(changes.dragulaModel.previousValue);
          this.drake.models.splice(modelIndex, 1, changes.dragulaModel.currentValue);
          this.drake.modelItemHandlers.splice(modelIndex, 1, modelItemHandler);
        } else {
          this.drake.models = [changes.dragulaModel.currentValue];
          this.drake.modelItemHandlers = [modelItemHandler];
        }
      }
    }
  }
}
