import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Proposal } from '../../../../models';
import { ProposalService } from '../../../../services/proposal';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import { RestClientService } from '../../../../services/rest-client/rest-client.service';
import { DiscountTemplate } from '../../../../models/discount-template.model';
import { TaxTemplate } from '../../../../models/tax-template.model';


@Component({
  selector: 'app-proposal-base-tax-discounts',
  template: '' // need to be set in child component
})
export class BaseTaxDiscountsComponent<ObjClass, TempClass> {
  // TODO: find how to load form components dynamically

  @Input() proposal: Proposal;
  @Output() onNext: EventEmitter<any> = new EventEmitter<any>();
  @Output() onBack: EventEmitter<any> = new EventEmitter<any>();

  modelName: string = '';
  header: string = '';

  public objectService: RestClientService<ObjClass>;
  public objects: ObjClass[] = [];

  public templateService: RestClientService<TempClass>;
  private objectTemplates: TempClass[];

  constructor(private flash: FlashMessageService,
              private proposalService: ProposalService) {
  }

  ngOnInit() {

    this.getObjectTemplates();
    this.getObjects();
  }

  getObjectTemplates() {
    this.templateService.getList({'status!': 'archived'})
      .map(res => res.results)

      .subscribe(res => {
        this.objectTemplates = res;
      });
  }

  getObjects() {
    this.objectService.getList({proposal: this.proposal.id})
      .map(res => res.results)
      .subscribe(res => {
        this.objects = res;
      });
  }

  addObject() {
    if (this.objects.length > 0 && !(<any>this.objects[0]).id)
      return;
    this.objects.unshift((<any>{
      proposal: this.proposal.id
    }));
  }

  createObject(e, objTemplate?: TempClass) {
    e.preventDefault();

    let data: any = Object.assign({
      proposal: this.proposal.id
    }, objTemplate);

    data.id = undefined;
    this.objectService.create(data)
      .subscribe((obj: any) => {
        this.objects.push(obj);
        this.flash.success(`${this.modelName} "${obj.name}" added to proposal`);
        this.proposalService.settingsChanged.next();
      }, error => {
        this.flash.error(`Error adding ${this.modelName}`);
      });
  }


  deleteObject(obj) {
    this.objectService.delete(obj.id)
      .subscribe(() => {
        let indexOf = this.objects.findIndex((item: any) => item.id === obj.id);
        if (indexOf > -1) {
          this.objects.splice(indexOf, 1);
          this.flash.success(`${this.modelName} "${obj.name}" removed from proposal`);
          this.proposalService.settingsChanged.next();
        }
      }, (error) => {
        this.flash.error(`Error deleting ${this.modelName}`);
      });
  }

  onSaveAsTemplate(template: TempClass) {
    this.objectTemplates.unshift(template);
  }

  onTemplateDeleted(template: DiscountTemplate | TaxTemplate) {
    let index = this.objectTemplates.findIndex(item => (<any>item).id === template.id);
    if (index > -1) {
      this.objectTemplates.splice(index, 1);
    }
  }

  onFormCancel(obj) {
    let index = this.objects.findIndex(item => item === obj);
    if (index > -1 && !obj.id) {
      this.objects.splice(0, 1);
    }

  }

  onNextClick() {
    if (this.objects.length > 0) {
      this.onNext.emit();
    }
  }

}
