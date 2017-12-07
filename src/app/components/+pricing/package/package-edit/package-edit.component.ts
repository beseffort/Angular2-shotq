import {
  Component,
  OnInit,
  ViewEncapsulation,
  AfterViewInit,
  ViewChild,
  OnDestroy
}                         from '@angular/core';
import { Router }         from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap';
import { ModalService }   from '../../../../services/modal/';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
declare let require: (any);

@Component({
    selector: 'package-edit',
    templateUrl: './package-edit.component.html',
    styleUrls : ['./package-edit.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PackageEditComponent {
  @ViewChild('childModal') public childModal: ModalDirective;
  public _ = require('../../../../../../node_modules/lodash');
  public items: Array<Object>;
  public filteredItems: Array<Object>;
  public itemsCategories: Array<Object>;
  public tabActive = 1;
  public optionActive = 1;
  public productContents= [];
  public productAdd= [];
  public productAddons= [];
  private router: Router;
  private costs: any = {
      selling: undefined,
      goods: undefined,
      shipping: undefined,
  };
  private description = null;
  private name = null;

  private packageCategories = ['Weddings', 'Extras', 'Other category', 'Another category'];
  private initData = ['Weddings', 'Extras'];
  private packageSelectedCategories = [];
  private selectedproductCategory = 'All Categories';
  private selectedProduct = 0;

  /* Set radix for parseInt */
  private radix: number = 10;



  constructor(private _router: Router, private dragulaService: DragulaService) {
    this.router = _router;
    const bag: any = dragulaService.find('first-bag');
    if (bag !== undefined ) dragulaService.destroy('first-bag');
    dragulaService.setOptions('first-bag', {
      mirrorContainer: document.body,
      copySortSource: false,
      revertOnSpill: false,
      moves: function (el, source, handle, sibling) {
        return source === document.getElementById('newProducts');
      },
      copy: function (el, source) {
        return source === document.getElementById('newProducts');
      },
      accepts: function (el, target) {
        return target !== document.getElementById('newProducts');
      }
    });
  }

  public ngOnInit() {
    /* Assign to aux vars to perform pre-process */
    this.items = [
      {'id': 0, 'name': 'Select a Product'},
      {'id': 1, 'name': 'Art Walls', 'type': 'product', 'price': 200.00, 'category_id': 2, 'goods_sold': 150.00, 'shipping': 0.00},
      {'id': 2, 'name': 'Canvas Gallery Wraps', 'type': 'product', 'price': 200.00, 'category_id': 2, 'goods_sold': 150.00, 'shipping': 0.00},
      {'id': 3, 'name': 'Image Pops', 'type': 'product', 'price': 200.00, 'category_id': 2, 'goods_sold': 150.00, 'shipping': 0.00},
      {'id': 4, 'name': 'Oil Print', 'type': 'product', 'price': 200.00, 'category_id': 3, 'goods_sold': 150.00, 'shipping': 0.00},
      {'id': 5, 'name': 'Test Print', 'type': 'product', 'price': 200.00, 'category_id': 3, 'goods_sold': 150.00, 'shipping': 0.00},
      {'id': 6, 'name': 'Service 1', 'type': 'product', 'price': 200.00, 'category_id': 4, 'goods_sold': 150.00, 'shipping': 0.00},
      {'id': 7, 'name': 'Service 2', 'type': 'product', 'price': 200.00, 'category_id': 4, 'goods_sold': 150.00, 'shipping': 0.00},
      {'id': 8, 'name': 'Uncat1', 'type': 'product', 'price': 200.00, 'category_id': 5, 'goods_sold': 150.00, 'shipping': 0.00},
      {'id': 9, 'name': 'Uncat2', 'type': 'product', 'price': 200.00, 'category_id': 5, 'goods_sold': 150.00, 'shipping': 0.00},
      {'id': 10, 'name': 'Archived', 'type': 'product', 'price': 200.00, 'category_id': 6, 'goods_sold': 150.00, 'shipping': 0.00},
      {'id': 11, 'name': 'Without category', 'type': 'product', 'price': 200.00, 'category_id': '', 'goods_sold': 150.00, 'shipping': 0.00}
    ];
    this.itemsCategories = [
      {'id': 0, 'name': 'All Categories'},
      {'id': 2, 'name': 'Art'},
      {'id': 3, 'name': 'Prints'},
      {'id': 4, 'name': 'Services'},
      {'id': 5, 'name': 'Uncategorized'},
      {'id': 6, 'name': 'Archived'}
    ];

    this.productContents.push({name: 'Blue Shoes' , unit: 1 , unitprice: '100.00', total: '100.00'});
    this.productContents.push({name: 'Blue Shoes' , unit: 1 , unitprice: '100.00', total: '100.00'});
    this.productContents.push({name: 'Blue Shoes' , unit: 1 , unitprice: '100.00', total: '100.00'});
    this.productAdd.push({name: 'Engagement Session' , unit: 1 , unitprice: '4,325.00', total: '4,325.00'});
    this.productAdd.push({name: 'Engagement Session' , unit: 1 , unitprice: '4,325.00', total: '4,325.00'});
    this.productAdd.push({name: 'Engagement Session' , unit: 1 , unitprice: '4,325.00', total: '4,325.00'});
    this.productAddons.push({name: 'Bamboo Print' , unit: 1 , unitprice: '17.50', total: '17.50'});
    this.productAddons.push({name: '12X12 Gallery Album' , unit: 1 , unitprice: '17.50', total: '17.50'});

    this.filteredItems = this._.cloneDeep(this.items);
    let body = document.getElementsByTagName('body')[0];
    body.classList.add('openOldModal');
  }
  ngAfterViewInit() {
    this.childModal.show();
    document.addEventListener('click', this.toggleOpenClass);
  }
  public ngOnDestroy() {
    this.childModal.hide();
    this.closeModal();
    document.removeEventListener('click', this.toggleOpenClass);
  }
  /**
   * [showChildModal description]
   */
  public showChildModal(): void {
    this.childModal.show();
  }
  /**
   * [hideChildModal description]
   */
  public hideChildModal(): void  {
    this.childModal.hide();
    this.closeModal();
  }
  /**
   * [closeModal description]
   */
  public closeModal() {
    let body = document.getElementsByTagName('body')[0];
    body.classList.remove('openOldModal');
    let backdrop = document.querySelectorAll('.modal-backdrop.fade.in'), i;
    document.querySelector('body').classList.remove('modal-open');
    for (i = 0; i < backdrop.length; ++i) {
      backdrop[i].classList.remove('in');
    }
  }
  /**
   * [toggleOpenClass description]
   * @param {any} $event [description]
   */
  public toggleOpenClass($event: any) {
      let hasClass = function (el, cls) {
          return el.className && new RegExp('(\\s|^)' + cls + '(\\s|$)').test(el.className);
      };
      let closestByClass = function(el, clazz) {
          while (!hasClass(el, clazz)) {
              el = el.parentNode;
              if (!el) {
                  return null;
              }
          }
          return el;
      };
      let classList = $event.target.classList;
      if (classList.contains('toggleOpen')) {
          if (closestByClass($event.target, 'open')) {
              if (classList.contains('child')) {
                  if ($event.target.parentElement.classList.contains('openChild')) {
                      $event.target.parentElement.classList.remove('openChild');
                  } else {
                      if (document.querySelectorAll('.openChild').length > 0) {
                          document.querySelector('.openChild').classList.remove('openChild');
                      }
                      $event.target.parentElement.classList.add('openChild');
                  }
              } else {
                  $event.target.parentElement.classList.remove('open');
              }
          } else {
              if (document.querySelectorAll('.open').length > 0) {
                  document.querySelector('.open').classList.remove('open');
              }
              $event.target.parentElement.classList.add('open');
          }
      } else {
          if (closestByClass($event.target, 'open') ) {
              if (classList.contains('optionBlock')) {
                  document.querySelector('.open').classList.remove('open');
              }
          } else {
              if (document.querySelectorAll('.open').length > 0) {
                  document.querySelector('.open').classList.remove('open');
              }
          }
      }
  }
  /**
   * [removeProduct description]
   * @param {[type]} index [description]
   */
  public removeProduct(index) {
      this.productContents.splice(index, 1);
  }
  /**
   * [removeAddon description]
   * @param {[type]} index [description]
   */
  public removeAddon(index) {
      this.productAddons.splice(index, 1);
  }
  /**
   * [filterByProductCategory description]
   * @param {any}    value   [description]
   * @param {[type]} catName [description]
   */
  public filterByProductCategory(value: any, catName) {
    this.selectedproductCategory = catName;
    let aux_items = [];

    for (let i = 0; i < this.items.length; i++) {
        let a = parseInt(value, this.radix);
        let b = parseInt(this.items[i]['category_id'], this.radix);
        if (a === b || a === 0 || this.items[i]['id'] === 0) {
          aux_items.push(this.items[i]);
        }
    }
    this.filteredItems = this._.cloneDeep(aux_items);
  }
}
