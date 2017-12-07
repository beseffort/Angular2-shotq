import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit }                        from '@angular/core';
import { Observable }             from 'rxjs/Observable';
/* Services */
import { FlashMessageService }    from '../../../services/flash-message';
import { ItemTemplateService }    from '../../../services/product/item-template';
import { PackageTemplateService } from '../../../services/product/package-template';
/* Models */
import { ItemTemplate }           from '../../../models/item-template';
import { PackageTemplate }        from '../../../models/package-template';
import { Item }                   from '../../../models/item';

import 'rxjs/Rx';

@Component({
    selector: 'delete',
    templateUrl: './delete.component.html',
    styleUrls: ['./delete.component.scss'],
    providers: [ItemTemplateService, PackageTemplateService]
})
export class DeleteComponent {
  @Input() data;
  @Input() serviceType: string;
  @Input() type: string;
  @Output() closeModal = new EventEmitter();

  private componentRef;
  private response = null;
  private apiCalls = [];
  private isLoading = false;

  constructor(
    private flash: FlashMessageService,
    private itemTemplateService: ItemTemplateService,
    private packageTemplateService: PackageTemplateService
  ) {}

  ngOnInit() {
  }

  /**
   * Set parent component ref
   * @param {[type]} ref [reference od parent component object]
   */
  public setComponentRef(ref) {
    this.componentRef = ref;
  }

  /**
   * Close modal saving modifications
   *
   */
  public confirm() {
    this.isLoading = true;

    let ids = [];
    for (let item of this.data) {
      switch (this.type) {
        case 'packages':
          let packageTemp = item as PackageTemplate;
          if (packageTemp.package_count === 0) {
            ids.push(packageTemp.id);
          }
        break;
        default:
          let itemTemp = item as ItemTemplate;
          if (itemTemp.item_count === 0) {
            ids.push(itemTemp.id);
          }
        break;
      }
    }
    if (ids.length === 0) {
      this.flash.error('The item(s) cannot be deleted because they are ordered.');
      this.isLoading = false;
      return;
    }
    let data = {'status': 'archived'};
    switch (this.type) {
      case 'packages':
        data['package_templates'] = ids;
      break;
      default:
        data['item_templates'] = ids;
      break;
    }

    let response = null;
    this[this.serviceType].bulkAdjustStatus(data)
      .subscribe(updateData => {
        response = updateData;
        this.componentRef.loadCategoriesAndItems(this.type);
        this.flash.success('The item(s) have been deleted.');
        this.closeModal.emit({action: 'close-modal'});
      },
      err => {
        this.flash.error('An error has occurred deleting items, please try again later.');
        console.error(err);
      },
      () => {
        this.isLoading = false;
      }
    );
  }
  /**
   * Close modal without saving modifications
   */
  public cancel() {
    this.closeModal.emit({action: 'close-modal'});
  }
}
