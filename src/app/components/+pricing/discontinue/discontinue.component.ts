import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit }                        from '@angular/core';
/* Services */
import { FlashMessageService }    from '../../../services/flash-message';
import { ItemTemplateService }    from '../../../services/product/item-template';
import { PackageTemplateService } from '../../../services/product/package-template';
/* Models */
import { ItemTemplate }           from '../../../models/item-template';
import { Item }                   from '../../../models/item';

@Component({
    selector: 'discontinue',
    templateUrl: './discontinue.component.html',
    styleUrls : ['./discontinue.component.scss'],
    providers: [ItemTemplateService, PackageTemplateService]
})
export class DiscontinueComponent {
  @Input() data;
  @Input() serviceType: string;
  @Input() type: string;
  @Output() closeModal = new EventEmitter();

  private componentRef;
  private response = null;
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
      let itemTemp = item as ItemTemplate;
      ids.push(itemTemp.id);
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
        this.flash.success('The items have been archived.');
        this.closeModal.emit({action: 'close-modal'});
      },
      err => {
        this.flash.error('An error has occurred discontinuing items, please try again later.');
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
