import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit }                        from '@angular/core';
import { Router }                 from '@angular/router';
/* Services */
import { ModalService }    from '../../../services/modal';
import { FlashMessageService }    from '../../../services/flash-message';
import { ItemTemplateService }    from '../../../services/product/item-template';
import { PackageTemplateService } from '../../../services/product/package-template';
/* Models */
import { ItemTemplate }           from '../../../models/item-template';
import { Item }                   from '../../../models/item';

@Component({
    selector: 'restore',
    templateUrl: './restore.component.html',
    styleUrls : ['./restore.component.scss'],
    providers: [ItemTemplateService, PackageTemplateService]
})
export class RestoreComponent {
  @Input() data;
  @Input() serviceType: string;
  @Input() type: string;
  @Output() closeModal = new EventEmitter();

  private componentRef;
  private isLoading = false;
  private router: Router;

  constructor(
    private flash: FlashMessageService,
    private itemTemplateService: ItemTemplateService,
    private packageTemplateService: PackageTemplateService,
    private modalService: ModalService,
    private _router: Router
  ) { this.router = _router; }

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
    let data = {'status': 'active'};
    switch (this.type) {
      case 'packages':
        data['package_templates'] = ids;
      break;
      default:
        data['item_templates'] = ids;
      break;
    }

    this[this.serviceType].bulkAdjustStatus(data)
      .subscribe(updateData => {
        this.componentRef.loadCategoriesAndItems(this.type);
        this.flash.success('The items have been restored.');
        this.closeModal.emit({action: 'close-modal'});

        if (ids.length === 1) {
          this.modalService.data = {
            url: ((this.type !== undefined) ?
              `pricing/${this.type}/edit/` + ids[0] :
              `pricing/items/edit/` + ids[0])
          };
        }
      },
      err => {
        this.flash.error('An error has occurred restoring items, please try again later.');
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
