import {
  Component,
  OnInit,
  OnChanges,
  ViewEncapsulation
}                                   from '@angular/core'  ;
import { Router }                   from '@angular/router';
import { Observable }               from 'rxjs/Rx';
/* Services */
import { ApiService }               from '../../../../services/api';
import { JobService }               from '../../../../services/job';
import { ItemService }              from '../../../../services/product/item/item.service';
import { ItemCategoryService }      from '../../../../services/product/item-category/item-category.service';
import { ItemTemplateService }      from '../../../../services/product/item-template/item-template.service';
import { PackageTemplateService }   from '../../../../services/product/package-template/package-template.service';
import { PackageCategoryService }   from '../../../../services/product/package-category/package-category.service';
import { FlashMessageService }      from '../../../../services/flash-message';
import { ModalService }             from '../../../../services/modal/';
import { GeneralFunctionsService }  from '../../../../services/general-functions';
import { BreadcrumbService }        from '../../../../components/shared/breadcrumb/components/breadcrumb.service';
/* Modules */
import { PackageAddModule }         from '../../package/package-add/package-add.module';
import { ItemActions }              from './menu-items';
import { AdjustItemPriceModule }    from '../adjust-item-price/adjust-item-price.module';
import { AdjustPackagePriceModule } from '../../package/adjust-package-price/adjust-package-price.module';
import { DiscontinueModule }        from '../../discontinue/discontinue.module';
import { RestoreModule }            from '../../restore/restore.module';
import { DeleteModule }             from '../../delete/delete.module';
/* Models */
import { Item }                     from '../../../../models/item';
import { ItemCategory }             from '../../../../models/item-category';
import { ItemTemplate }             from '../../../../models/item-template';
/*Modal*/
import { ManageCategoriesModule }   from '../manage-categories/';
declare let require: (any);

@Component({
  selector: 'item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss'],
  providers: [
    ItemService,
    ItemCategoryService,
    GeneralFunctionsService,
    ItemTemplateService,
    PackageCategoryService,
    PackageTemplateService
  ],
  encapsulation: ViewEncapsulation.None
})
export class ItemListComponent {
  public _ = require('../../../../../../node_modules/lodash');
  public tabs: Array<any> = [
    {
      title: 'Products and Services', status: 'products_and_services', filters: []
    },
    {
      title: 'Packages', status: 'packages', filters: []
    }
  ];

  public currentTab = this.tabs[0];
  public currentStatus = this.currentTab['status'];
  public isLoading: boolean = false;
  public itemsQty: Array<any>;
  public auxItems: Array<Object>;
  public items: Array<any>;
  public packages: Array<Object>;
  public auxCategories: Array<Object>;
  public categories: Array<Object>;
  public selectedCategory: any;
  public defaultCatOpen: any = 2;
  public itemQtySelected: number = 0;
  private alertify = require('../../../../assets/theme/assets/vendor/alertify-js/alertify.js');
  private router: Router;
  private selectAllChecked: boolean = false;
  private itemsChecked: Array<any> = [];
  private itemActions = ItemActions;
  private isSubscribed: boolean = false;
  private paginator = [];
  private visibleFields: Array<string>;
  private itemCategories: Array<any>;
  private itemNotAssocCategories: Array<number>;
  /* Set radix for parseInt */
  private radix: number = 10;
  private modalInstance = null;
  /* Search properties */
  private search_box: string;
  private currentPage: number = 1;
  private perPage: number = 5;
  private totalItems: number = 0;
  private subscriber;
  private categoriesToUpdate = {};
  /* HARD CATEGORIES IDs:
   *   - ALL = 0
   *   - ARCHIVED = -1
   *   - UNCATEGORIZED = -2
   */
  private allCategory: any = {
    'id': 0,
    'name': 'All',
    'account': this.apiService.getAccount(),
    'item_count': 0,
    'item_template_count': 0,
    'package_template_count': 0
  };
  private discCategory: any = {
    'id': -1,
    'name': 'Archived',
    'account': this.apiService.getAccount(),
    'item_count': 0,
    'item_template_count': 0,
    'package_template_count': 0
  };
  private uncatCategory: any = {
    'id': -2,
    'name': 'Uncategorized',
    'account': this.apiService.getAccount(),
    'item_count': 0,
    'item_template_count': 0,
    'package_template_count': 0
  };
  /* Hard categories */
  private hardCategories: Array<number> = [0, -1, -2];
  private sort = {
    sortedByName: true,
    nameAsc: true,
    dateCreatedAsc: true,
    sortedBy: 'name'
  };
  private icons = {
    nameUp: 'icon icon-up-arrow',
    nameDown: 'icon icon-down-arrow',
  };
  private actionsBar = {
    color: 'gray',
    enabled: false,
    deleteBtn: {
      message: 'Are you sure you want to do this?',
    }
  };
  /**
   * Set values by default.
   * @type {String}
   */
  private serviceToUseCategory = 'itemCategoryService';
  private serviceToUseItem = 'itemTemplateService';
  private blockDropdown: boolean = false;
  private currentCategories: Array<any> = [];

  constructor(private apiService: ApiService,
              private breadcrumbService: BreadcrumbService,
              private modalService: ModalService,
              private _router: Router,
              private itemService: ItemService,
              private itemCategoryService: ItemCategoryService,
              private itemTemplateService: ItemTemplateService,
              private packageCategoryService: PackageCategoryService,
              private packageTemplateService: PackageTemplateService,
              private flash: FlashMessageService,
              private generalFunctions: GeneralFunctionsService) {
    this.router = _router;
    breadcrumbService.addFriendlyNameForRoute('/pricing/items', 'Products & Services');
    this.visibleFields = [
      'name',
      'price',
      'item_type',
      'ordered',
      'sold'
    ];
    // Initialize paginator for archived category.
    this.paginator[-1] = {'totalItems': 0, 'currentPage': 1, 'perPage': 5};
    // Initialize paginator for uncategorized category.
    this.paginator[-2] = {'totalItems': 0, 'currentPage': 1, 'perPage': 5};
  }

  /**
   * Function to check for array.
   * @param {[type]} key [description]
   */
  public inArray(key) {
    return this.generalFunctions.inArray(this.visibleFields, key);
  }

  public ngOnInit() {
    if (location.hash.search('modalOpen') > -1) {
      location.hash = location.hash.replace('?modalOpen', '');
    }
    /* Set alertify theme */
    this.alertify.theme('bootstrap-shootq');
    this.alertify.okBtn('OK');
    /* Load categories and items */
    this.loadCategoriesAndItems();
  }

  /**
   * Funciton to initialize currentCategories array, this array stores each category associated to an item.
   * It's necessary to initialize in this way to clean up the code and keep consistency.
   */
  public currentCategoriesInit() {
    let itemsCheckedLength = this.itemsChecked.length;
    for (let i = 0; i < itemsCheckedLength; i++) {
      if (this.currentCategories[this.itemsChecked[i]] === undefined) {
        this.currentCategories[this.itemsChecked[i]] = []; // Set current item categories
      }
    }
  }

  /**
   * Function to clear search input text.
   */
  public clearSearchInput(e) {
    this.search_box = '';
    this.search(e, this.selectedCategory, this.currentStatus);
  }

  /**
   * Function to handle the tab change section
   *
   * @param {index} index the tab index
   */
  public handleTabChange(index: number) {
    // Reset archived paginator.
    this.paginator[-1] = {'totalItems': 0, 'currentPage': 1, 'perPage': 5};
    // Reset uncategorized paginator.
    this.paginator[-2] = {'totalItems': 0, 'currentPage': 1, 'perPage': 5};
    let tab = this.tabs[index];
    this.currentTab = tab;
    this.currentStatus = tab.status;
    this.selectedCategory = this.categories[0]['id'];
    /**
     * Navigate through tabs
     */
    this.reloadBasedOnCurrentTab(this.currentStatus);
  }

  /**
   * reload based on the current status.
   * @param {string} currentStatus [description]
   */
  public reloadBasedOnCurrentTab(currentStatus: string, params?: any) {
    switch (currentStatus) {
      case 'products_and_services':
        if (params !== undefined && params.keepSelections !== undefined) {
          this.loadCategoriesAndItems(undefined, params.keepSelections);
        } else {
          this.loadCategoriesAndItems(undefined);
        }
        break;
      case 'packages':
        this.loadCategoriesAndItems('packages');
        break;
      default:
        break;
    }
  }

  /**
   * [ngOnDestroy description]
   */
  ngOnDestroy() {
    let body = document.getElementsByTagName('body')[0];
    body.classList.remove('openOldModal');
    body.classList.remove('actionPricingItems');
    this.isSubscribed = false;
    this.subscriber.unsubscribe();
  }

  /**
   * Function to load categories & items.
   * @param {any} type [description]
   */
  public loadCategoriesAndItems(type?: any, keepSelections?: boolean) {
    this.categoriesToUpdate = {};
    /* Reset counters */
    this.discCategory.package_template_count = 0;
    this.discCategory.item_template_count = 0;
    /* Check and set service type */
    this.setServiceType(type);
    /* Enable load spinner */
    this.isLoading = true;
    if (this.isSubscribed) {
      // unsubscribe
      this.subscriber.unsubscribe();
    } else {
      this.isSubscribed = true;
    }
    let o = this.generalFunctions.getSortOrderParam(this.sort, 'name');
    let params = {
      order: o,
      exclude_status: 'archived'
    };
    /**
     * Function to process API calls and then receive all the responses.
     *
     * @param {any) => res)} this.itemTemplateService.getList().map((res Retrieve products/item
     * @param {any) => res)} this.itemCategoryService.getList().map((res Retrieve products/itemCategory
     */
    this.subscriber = Observable.forkJoin(
      this[this.serviceToUseItem].getList(params),
      this[this.serviceToUseCategory].getList()
    )
      .subscribe(([itemResponse, categoryResponse]: [any, any]) => {
          if (keepSelections !== undefined && keepSelections === false) {
            this.itemsChecked = [];
            this.selectAllChecked = false;
            this.itemQtySelected = 0;
          }
          /* Set Items to the view */
          this.auxItems = itemResponse.results;
          /* Set Categories to the view */
          this.auxCategories = categoryResponse.results;
          /* Add "ALL" category harcoded to the list in order to show all items or packages elements */
          /* Update the proper counter */
          ((type === 'packages')
              ? this.allCategory.package_template_count = itemResponse.count
              : this.allCategory.item_template_count = itemResponse.count
          );
          /* Put element at the top in the auxCategories array */
          this.auxCategories.unshift(this.allCategory);
          this.auxCategories.push(this.uncatCategory);
          for (let i = 0; i <= categoryResponse.count; i++) {
            for (let j = 0; j < categoryResponse.results.length; j++) {
              if (categoryResponse.results[j] !== undefined && this.paginator[categoryResponse.results[j].id] === undefined) {
                this.paginator[categoryResponse.results[j].id] = {
                  'totalItems': itemResponse.count,
                  'currentPage': 1,
                  'perPage': 5
                };
              }
            }
          }
          /* After get items get qty for each category */
          this.getGroupedQty(this.auxItems, this.auxCategories, type);
          /* Assign to process in view */
          this.categories = this.auxCategories;
          this.items = this.groupItemCategory(this.auxItems, this.auxCategories);
          /* Set default selected category */
          if (this.selectedCategory === undefined) {
            this.selectedCategory = this.categories[0]['id'];
          }
        },
        err => {
          console.error(err);
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  /**
   * Function to only reload items inside of the category accordion.
   */
  public reloadItems(categoryId, type?: any) {
    this.setServiceType(type);
    this.isLoading = true;
    if (this.isSubscribed) {
      // unsubscribe
      this.subscriber.unsubscribe();
    } else {
      this.isSubscribed = true;
    }
    let o = this.generalFunctions.getSortOrderParam(this.sort, 'name');
    let p = this.generalFunctions.getPaginatorParam(this.paginator, categoryId);
    let status = this.checkIfArchivedAndGetStatus(categoryId);
    let params = {
      order: o,
      categories: ((this.hardCategories.indexOf(categoryId) !== -1) ? undefined : categoryId),
      status: status
    };
    this.subscriber = this[this.serviceToUseItem].getList(params)
      .subscribe(
        ItemResponse => {
          this.auxItems = ItemResponse.results;
          if (categoryId === undefined) {
            /* After get items get qty for each category */
            this.getGroupedQty(this.auxItems, this.auxCategories);
            /* Assign to process in view */
            this.categories = this.auxCategories;
          }
          this.items[categoryId] = [];
          this.items[categoryId] = this.auxItems;
          /* Set checkboxes status */
          this.selectAllChecked = (this.itemsChecked.length === this.items[this.selectedCategory].length);
          this.actionsBar.enabled = (this.itemsChecked.length > 0);
        },
        err => {
          this.isLoading = false;
          console.error(err);
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  /**
   * Function to search items through API.
   *
   * @param {event} e [description]
   */
  public search(e: any, categoryId: number, type?: any) {
    this.setServiceType(type);
    if (e && e.keyCode === 27 || categoryId === undefined) {
      this.isLoading = false;
      return false;
    }
    this.isLoading = true;
    if (e && e.keyCode === 8 && this.search_box === '') {
      this.isLoading = false;
    }
    if (e) {
      // Each time the user type a letter the page should be set to 1
      this.currentPage = 1;
    }
    if (this.search_box === undefined) {
      this.search_box = '';
    }
    let sort = 'name,created';
    let status = this.checkIfArchivedAndGetStatus(categoryId);
    // search active
    this[this.serviceToUseItem].search(this.search_box, {
      page: this.paginator[categoryId].currentPage,
      page_size: this.paginator[categoryId].perPage,
      ordering: sort,
      categories: ((this.hardCategories.indexOf(categoryId) !== -1) ? undefined : categoryId),
      status: status
    }).subscribe(response => {
        this.items[categoryId] = response.items;
        this.paginator[categoryId].totalItems = response.total;
      },
      err => {
        console.error(`ERROR: ${err}`);
        this.isLoading = false;
      },
      () => {
        this.uncheckAll();
        this.isLoading = false;
      }
    );
  }

  /**
   * Set all checkboxes unselected.
   */
  public uncheckAll() {
    /* Set checkboxes unselected */
    this.itemsChecked = [];
    this.selectAllChecked = false;
    this.actionsBar.enabled = false;
    this.itemQtySelected = 0;
  }

  public onAccordionOpen(e: any) {
    this.uncheckAll();
  }

  /**
   * Update the item list when a change page event is emited by pagination component
   * @param {[type]} event [description]
   */
  public handlePageChange(event, categoryId) {
    // update paginator
    this.paginator[categoryId].currentPage = event.results;
    this.paginator[categoryId].perPage = event.perPage;
    this.itemsChecked = [];
    this.itemQtySelected = 0;
    this.selectAllChecked = false;
    if (categoryId !== -2 && categoryId !== -1) {
      this.reloadItems(categoryId);
    }
  }

  /**
   * Open modal to create an object depends of which tab is selected
   */
  public openModal() {
    if (this.currentStatus === 'products_and_services') {
      this.router.navigate(['pricing/items/add']);
    } else {
      this.router.navigate(['proposals/package-template/add']);
    }
  }

  /**
   * Open modal to adjust prices
   * @param {any} type [Current tab]
   */
  public openAdjustPriceModal(type?: any) {
    let title = 'Adjust Prices';
    let style = 'modal-lg jobInfoBlock';
    let aux_modal_data = [];
    let status = this.checkIfArchivedAndGetStatus(this.selectedCategory);
    let params = {
      categories: ((this.hardCategories.indexOf(this.selectedCategory) !== -1) ? undefined : this.selectedCategory),
      status: status
    };
    this.setServiceType(type);
    this.isLoading = true;
    // get items/packages from selected category and load modal with them
    this[this.serviceToUseItem].getList(params)
      .subscribe(
        ItemResponse => {
          aux_modal_data = this._.cloneDeep(ItemResponse.results);

          if (this.currentStatus === 'products_and_services') {
            this.modalService.setModalContent(AdjustItemPriceModule, title, style);
          } else {
            this.modalService.setModalContent(AdjustPackagePriceModule, title, style);
          }

          if (this.modalInstance) {
            this.modalInstance.data = aux_modal_data;
            this.modalInstance.ngOnInit();
          }

          this.modalService.setBodyCssClass('adjust-prices-modal');
          this.modalService.showModal();
          let subscriber = this.modalService.templateChange.subscribe(data => {
            this.modalInstance = data.instance;
            this.modalInstance.setComponentRef(this);
            this.modalInstance.data = aux_modal_data;
            this.modalInstance.ngOnInit();
          });
          this.modalService.subscribeTemplateChange(subscriber);
        },
        err => {
          console.error(err);
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  /**
   * Function to open modal and call
   * proper module
   *
   *   - DiscontinueModule
   *   - DeleteModule
   *   - RestoreModule
   *
   * to execute proper action:
   *
   * @param {string} action [description]
   * @param {any}    item   [description]
   * @param {any}    type   [description]
   */
  public openActionsModal(action: string, item?: any) {
    let body = document.getElementsByTagName('body')[0];
    body.classList.add('openOldModal');
    body.classList.add('actionPricingItems');
    this.setServiceType(this.currentStatus);
    let style = 'modal-md';
    let items = [];
    let title = '';

    switch (action) {
      case 'discontinue':
        title = 'Discontinue';
        this.modalService.setModalContent(DiscontinueModule, title, style);
        break;
      case 'trash':
        title = 'Delete';
        this.modalService.setModalContent(DeleteModule, title, style);
        break;
      case 'restore':
        title = 'Restore';
        this.modalService.setModalContent(RestoreModule, title, style);
        break;
      default:
        break;
    }

    if (item !== undefined && item !== '') {
      items.push(item);
    } else if (this.itemsChecked.length > 0) {
      if (action !== 'restore') {
        let allCategories = this._.map(this.categories, (v, k) => v.id);
        for (let cat of allCategories) {
          if (this.items[cat]) {
            for (let _item of this.items[cat]) {
              if (this.generalFunctions.inArray(this.itemsChecked, _item.id)) {
                items.push(_item);
              }
            }
          }
        }
      } else {
        for (let it of this.items[this.discCategory.id]) {
          if (this.generalFunctions.inArray(this.itemsChecked, it.id)) {
            items.push(it);
          }
        }
      }
    }

    if (items.length <= 0) {
      this.flash.error('Please, select an item before proceed.');
      return;
    }

    let aux_items = this._.cloneDeep(items);

    if (this.modalInstance) {
      this.modalInstance.data = aux_items;
      this.modalInstance.serviceType = this.serviceToUseItem;
      this.modalInstance.type = ((this.currentStatus && this.currentStatus === 'products_and_services')
        ? 'items'
        : this.currentStatus);
    }

    this.modalService.showModal();
    let subscriber = this.modalService.templateChange.subscribe(data => {
      this.modalInstance = data.instance;
      this.modalInstance.setComponentRef(this);
      this.modalInstance.data = aux_items;
      this.modalInstance.serviceType = this.serviceToUseItem;
      this.modalInstance.type = ((this.currentStatus && this.currentStatus === 'products_and_services')
        ? 'items'
        : this.currentStatus);
    });

    if (action === 'restore') {
      this.modalService.subscribeTemplateChange(subscriber);
      let closeSubscriber = this.modalService.hiddenModal
        .subscribe(data => {
          let modalData = this.modalService.data;
          if (modalData !== undefined && modalData.url !== undefined) {
            this.router.navigate([modalData.url]);
          }
        });
      this.modalService.subscribeHiddenModal(closeSubscriber);
    }
  }

  /**
   * Function to set selected category id.
   *
   * @param {any} category id
   */
  public setCategory(e: any, id: number) {
    if (id || id === 0) {
      this.selectedCategory = id;
      if (e.target.className === 'panel-title') { // Only call to search items reload if accordion element is selected
        this.search(undefined, id, this.currentStatus);
      }
    }
  }

  /**
   * Returns the proper sort icon to display
   * @param  {string} The type of sort (name, date)
   * @return {string} The icon class.
   */
  private getIcon(type: string): string {
    switch (type) {
      case 'sort_name':
        return ((this.sort.nameAsc) ? this.icons.nameUp : this.icons.nameDown);
      default:
        break;
    }
  }

  /**
   * Function to check if a Item is checked.
   * @param {Object} / The item in list.
   */
  private isChecked(item: any) {
    return (this.itemsChecked.indexOf(item.id) !== -1);
  }

  /**
   * Toogle the checked status of a Item
   * @param {[Item]}
   */
  private toggleCheckItem(item) {
    if (!this.isChecked(item)) {
      this.checkItem(item);
      this.itemQtySelected += 1;
    } else {
      this.uncheckItem(item);
      this.itemQtySelected -= 1;
    }
    /* Initialize array to avoid inconsistences in item categories selection */
    this.currentCategoriesInit();
    this.toggleActionButtonBar();
  }

  /**
   * Function to handle and sort (with API) alphabetically or by date.
   * @param {string} type [description]
   */
  private changeSortBy(type: string, categoryId: number) {
    // update flags
    if (type === 'name') {
      this.sort.sortedByName = true;
      this.sort.nameAsc = !this.sort.nameAsc;
    } else {
      this.sort.sortedByName = false;
      this.sort.dateCreatedAsc = !this.sort.dateCreatedAsc;
    }
    // call get items.
    this.reloadItems(categoryId);
  }

  /**
   * Check all the items
   */
  private checkAll(categoryId: number) {
    this.selectAllChecked = !this.selectAllChecked;
    this.itemsChecked.splice(0);
    if (this.selectAllChecked) {
      this.itemQtySelected = 0;
      let index = 0;
      let first = (this.paginator[categoryId].currentPage - 1) * this.paginator[categoryId].perPage;
      let last = first + this.paginator[categoryId].perPage;
      for (let c of this.items[categoryId]) {
        if (categoryId >= 0 || ((categoryId === -1 || categoryId === -2) && (index >= first && index < last))) {
          this.checkItem(c);
          this.itemQtySelected++;
        }
        index++;
      }
    } else {
      this.itemQtySelected = 0;
    }
    /* Initialize array to avoid inconsistences in item categories selection */
    this.currentCategoriesInit();
    this.toggleActionButtonBar();
  }

  /**
   * Check/uncheck an item.
   * @param {Object}
   */
  private checkItem(item: any) {
    this.itemsChecked.push(item.id);
    if (this.itemsChecked.length === this.items[this.selectedCategory].length) {
      this.selectAllChecked = true;
    }
  }

  /**
   * Uncheck an Item
   * @param {Object}
   */
  private uncheckItem(item: any) {
    let i = this.itemsChecked.indexOf(item.id);
    this.itemsChecked.splice(i, 1);
    this.selectAllChecked = false;
  }

  /**
   * toogle enabled/disabled status of the action button bar
   */
  private toggleActionButtonBar() {
    if (this.itemsChecked.length > 0) {
      this.actionsBar.enabled = true;
    } else {
      this.actionsBar.enabled = false;
    }
  }

  /**
   * Function to get the qty of each item in category.
   *
   * @param {any} items      The items
   * @param {any} categories The categories
   */
  private getGroupedQty(items: any, categories: any, type?: any) {
    this.addArchivedCategory(items, categories, type);
    this.addUncategorizedCategory(items, categories, type);
    for (let category of categories) {
      if (type !== undefined && type === 'packages') {
        this.paginator[category.id].totalItems = category.package_template_count;
      } else {
        this.paginator[category.id].totalItems = category.item_template_count;
      }
    }
  }

  /**
   * Function to group categories and items.
   *
   * @param {any}    items      [description]
   * @param {any}    categories [description]
   * @param {number} categoryId [description]
   */
  private groupItemCategory(items: any, categories: any, categoryId?: number, type?: any) {
    let auxItems = [];
    let c: Array<number> = [];
    for (let cat of categories) {
      c[cat.id] = 0;
    }
    for (let cat of categories) {
      let index = 0;
      for (let item of items) {
        let minIndex = (this.paginator[cat.id].currentPage - 1) * this.paginator[cat.id].perPage;
        let maxIndex = minIndex + this.paginator[cat.id].perPage;
        if (item.hasOwnProperty('categories')
          && Array.isArray(item['categories'])
          && (item['categories'].indexOf(cat.id) !== -1 || cat.id === 0 || (item['categories'].length === 0 && cat.id === -2))) {
          let max = this.paginator[cat.id].perPage - 1;
          if (cat.id === -2) {
            max = this.paginator[cat.id].totalItems;
          }
          if (c[cat.id] <= max) {
            if (item.status !== 'archived') {
              if (auxItems[cat.id] === undefined) {
                auxItems[cat.id] = [];
                auxItems[cat.id].push(item);
              } else {
                auxItems[cat.id].push(item);
              }
              c[cat.id] += 1;
            } else {
              if (auxItems[-1] === undefined) {
                auxItems[-1] = [];
              }

              let found = false;
              // check if the item already exists on archived category
              for (let i = 0; i < auxItems[-1].length; i++) {
                if (auxItems[-1][i].id === item.id) {
                  found = true;
                }
              }

              if (!found) {
                auxItems[-1].push(item);
              }
            }
          }
          index++;
        }
      }
    }
    return auxItems;
  }

  /**
   * Add discontinue category if exists archived items
   * @param {any}    items      [description]
   * @param {any}    categories [description]
   *
   */
  private addArchivedCategory(items: any, categories: any, type?: any) {
    // check archived items and count them
    let disc = 0;
    for (let item of items) {
      let disc_item = item as ItemTemplate;
      if (disc_item !== undefined && disc_item.status === 'archived') {
        disc++;
        for (let category of categories) {
          if ((this.generalFunctions.inArray(item.categories, category.id) && category.id !== -1) || category.id === 0) {
            if (type !== undefined && type === 'packages') {
              category.package_template_count--;
            } else {
              category.item_template_count--;
            }
          }
        }
      }
    }
    let currentCat = this.paginator[-1]['currentPage'];
    let perPage = this.paginator[-1]['perPage'];

    this.paginator[-1]['totalItems'] = disc;
    this.paginator[-1]['currentPage'] = currentCat;
    this.paginator[-1]['perPage'] = perPage;
    if (type !== undefined && type === 'packages') {
      this.discCategory.package_template_count = disc;
    } else {
      this.discCategory.item_template_count = disc;
    }
  }

  /**
   * Add items to Uncategorized category if there're items without category associated.
   * @param {any}    items      [description]
   * @param {any}    categories [description]
   *
   */
  private addUncategorizedCategory(items: any, categories: any, type?: any) {
    // check uncategorized items and count them.
    let uncat = 0;
    for (let item of items) {
      let uncat_item = item as ItemTemplate;
      if (uncat_item !== undefined && uncat_item.status === 'active' && uncat_item['categories'].length === 0) {
        uncat++;
      }
    }
    let currentCat = this.paginator[-2]['currentPage'];
    let perPage = this.paginator[-2]['perPage'];

    this.paginator[-2]['totalItems'] = uncat;
    this.paginator[-2]['currentPage'] = currentCat;
    this.paginator[-2]['perPage'] = perPage;
    if (type !== undefined && type === 'packages') {
      this.uncatCategory.package_template_count = uncat;
    } else {
      this.uncatCategory.item_template_count = uncat;
    }
  }

  /**
   * Function that handele item list single action.
   *
   * @param {Object} action  The object with available actions to handle.
   * @param {Object} contact The object with item information.
   */
  private singleItemAction(action, item, type) {
    switch (action.id) {
      case 'copy':
        this.setServiceType(type);
        this.isLoading = true;
        // Call API and clone item.
        this[this.serviceToUseItem].clone(item.id)
          .subscribe(
            res => {
              let template_id = undefined;
              if (typeof res === 'string') {
                res = JSON.parse(res);
              }
              template_id = res.template_id;
              this.flash.success(`The item ${item.name} has been copied.`);
              if (type !== undefined) {
                this.router.navigate([`pricing/${type}/edit/${template_id}`]);
              } else {
                this.router.navigate([`pricing/items/edit/${template_id}`]);
              }
            },
            err => {
              console.error(err);
              this.isLoading = true;
            },
            () => {
              this.isLoading = true;
            }
          );
        break;
      case 'pricing-package-edit':
        this.router.navigate(['/proposals', 'package-template', 'edit', item.id]);
        break;
      case 'pricing-items-edit':
        this.router.navigate([`${action.id.replace(/-/g, '/')}/${item.id}`]);
        break;
      case 'discontinue':
        this.openActionsModal('discontinue', item);
        break;
      case 'trash':
        this.openActionsModal('trash', item);
        break;
      case 'restore':
        this.openActionsModal('restore', item);
        break;
      default:
        break;
    }
  }

  /**
   * Open Manage categories modal to handle categories.
   */
  private openManageCategoriesModal(type: any) {
    let body = document.getElementsByTagName('body')[0];
    body.classList.add('openOldModal');
    let title = 'Manage Categories';
    this.setServiceType(type);
    if (this.modalInstance) {
      this.modalInstance.categoryServiceType = this.serviceToUseCategory;
      this.modalInstance.type = type;
      this.modalInstance.ngOnInit();
    }
    this.modalService.setModalContent(ManageCategoriesModule, title);
    this.modalService.disableKeyboardListener();
    this.modalService.setCssClass('modal-manage-categories');
    this.modalService.showModal();
    let subscriber = this.modalService.templateChange.subscribe(data => {
      this.modalInstance = data.instance;
      this.modalInstance.setComponentRef(this);
      this.modalInstance.categoryServiceType = this.serviceToUseCategory;
      this.modalInstance.type = type;
    });
    this.modalService.subscribeTemplateChange(subscriber);
  }

  /**
   * Funciton to associate / deassociate categories for selected items.
   * @param {any} e [description]
   */
  private associativeAction(e: any) {
    this.blockDropdown = true;
    if (e === 'refresh') {
      let params = {keepSelections: true};
      this.reloadBasedOnCurrentTab(this.currentStatus, params);
    }
    // Get the checked item/s
    // Get the checked item/s categories
    // Add/remove category from checked item/s.
    let itemsCheckedLength = this.itemsChecked.length;
    let auxItems = [];
    for (let i = 0; i < itemsCheckedLength; i++) {
      // Search over items the selected ones. categories should be searched from API, since latest change.
      let o = this.generalFunctions.getSortOrderParam(this.sort, 'name');
      let status = this.checkIfArchivedAndGetStatus(this.selectedCategory);
      let params = {
        order: o,
        categories: ((this.hardCategories.indexOf(this.selectedCategory) !== -1) ? undefined : this.selectedCategory),
        status: status
      };
      setTimeout(() => {
        this.subscriber = this[this.serviceToUseItem].getList(params)
          .subscribe(
            ItemResponse => {
              auxItems[this.selectedCategory] = ItemResponse.results;
              let catIds = [];
              for (let a of this.itemCategories) {
                catIds.push(a.id);
              }
              for (let item of auxItems[this.selectedCategory]) {
                // Get categories
                let catAux = [];
                for (let cat of item.categories) {
                  if (catAux.indexOf(cat) === -1) {
                    catAux.push(cat);
                  }
                }
                this.categoriesToUpdate[item.id] = catAux;
              }
              if (e !== undefined && e.hasOwnProperty('checked') && e.checked === true && (this.categoriesToUpdate[this.itemsChecked[i]])) {
                // Add category to item id
                if (this.categoriesToUpdate[this.itemsChecked[i]].indexOf(e.id) === -1) {
                  this.categoriesToUpdate[this.itemsChecked[i]].push(e.id);
                }
                let data: any = {
                  'id': this.itemsChecked[i],
                  'account': 1,
                  'categories': this.categoriesToUpdate[this.itemsChecked[i]]
                };
                this[this.serviceToUseItem].update(data)
                  .subscribe(
                    res => {
                      this.flash.success(`Item(s) has been added to category ${e.name}`);
                    },
                    err => {
                      console.error(err);
                    },
                    () => {
                      this.blockDropdown = false;
                    }
                  );
              } else if (e !== undefined && e.hasOwnProperty('checked') && (this.categoriesToUpdate[this.itemsChecked[i]])) {
                // Remove category to item id
                let index = this.categoriesToUpdate[this.itemsChecked[i]].indexOf(e.id);
                if (index > -1) {
                  // if category exist in this.currentCategories array.
                  this.categoriesToUpdate[this.itemsChecked[i]].splice(index, 1);
                  let data: any = {
                    'id': this.itemsChecked[i],
                    'account': 1,
                    'categories': this.categoriesToUpdate[this.itemsChecked[i]]
                  };
                  this[this.serviceToUseItem].update(data)
                    .subscribe(
                      res => {
                        this.flash.success(`Item(s) has been removed from category ${e.name}`);
                      },
                      err => {
                        console.error(err);
                      },
                      () => {
                        this.blockDropdown = false;
                      }
                    );
                }
              } else {
                this.blockDropdown = false;
              }
            },
            err => {
              this.isLoading = false;
              console.error(err);
            },
            () => {
              this.isLoading = false;
              this.blockDropdown = false;
            }
          );
      }, 150);
    }
  }

  /**
   * Function to get the list of categories to pass to drop-down
   * This list include:
   *  - Categories associated to selected items (Remove form category option)
   *  - Categories not associated to selected items (Add to category option)
   * @param {number} categoryId The item category id.
   */
  private getItemCategories(categoryId: number) {
    // Get items checked
    this.itemCategories = [];
    let itemsCheckedLength = this.itemsChecked.length;
    if (itemsCheckedLength > 0) {
      // Iterate over selected items.
      for (let i = 0; i < itemsCheckedLength; i++) {
        // Search over items the selected ones.
        if (this.items[categoryId]) {
          for (let item of this.items[categoryId]) {
            if (this.generalFunctions.inArray(this.itemsChecked, item.id)) {
              // Get categories
              for (let cat of item.categories) {
                if (!this.generalFunctions.inArray(this.itemCategories, cat)) {
                  this.itemCategories.push(cat);
                }
              }
            }
          }
        }
      }
      // Get categories not associated.
      let auxAssociatedCategories = [];
      for (let category of this.itemCategories) {
        // Insert only if the category is not into the array.
        if (auxAssociatedCategories.length === 0 || !this.generalFunctions.inArray(auxAssociatedCategories, category)) {
          auxAssociatedCategories.push(category);
        }
      }
      // Get all categories
      this.itemNotAssocCategories = this._.map(this.categories, (v, k) => v.id);
      for (let category of auxAssociatedCategories) {
        let index = this.itemNotAssocCategories.indexOf(category);
        if (index > -1) {
          // Remove categories associated to an item and left only not associated categories.
          this.itemNotAssocCategories.splice(index, 1);
        }
      }
      let auxItemCat = [];
      let auxItemNotAssocCat = [];
      let category: any;
      for (category of this.categories) {
        if (category.id !== 0 && category.id !== -2) { // Exclude "All" & "Uncategorized" categories.
          if (this.generalFunctions.inArray(this.itemCategories, category.id)) {
            let data: any = {'id': category.id, 'name': category.name, 'checked': true};
            auxItemCat.push(data);
          }
          if (this.generalFunctions.inArray(this.itemNotAssocCategories, category.id)) {
            let data: any = {'id': category.id, 'name': category.name, 'checked': false};
            auxItemNotAssocCat.push(data);
          }
        }
      }
      this.itemCategories = auxItemCat;
      this.itemNotAssocCategories = auxItemNotAssocCat;
    }
  }

  /**
   * Function to set proper service to use in functions.
   *
   * @param {any} type [description]
   */
  private setServiceType(type?: any) {
    switch (type) {
      case 'packages':
        /* Packages (Services) */
        this.serviceToUseCategory = 'packageCategoryService';
        this.serviceToUseItem = 'packageTemplateService';
        break;
      default:
        /* Default is Product and Services (Services) */
        this.serviceToUseCategory = 'itemCategoryService';
        this.serviceToUseItem = 'itemTemplateService';
        break;
    }
  }

  /**
   * Function to check by category and return the correct status.
   *
   * @param {[type]} categoryId [description]
   */
  private checkIfArchivedAndGetStatus(categoryId) {
    /*if (categoryId === 0) { // Enable if you need to show dicontinued items in All category
     return undefined;
     }*/
    return ((categoryId === -1) ? 'archived' : 'active');
  }

  /**
   * Function to count and display archived items in "All" category.
   */
  private countArchivedItems(categoryId: number): string {
    if (categoryId === 0) { // Only for "All" category
      if (this.currentStatus === 'packages' && this.discCategory.package_template_count > 0) { // Only show if there're archived items
        return `/ ${this.discCategory.package_template_count} Archived`;
      } else if (this.discCategory.item_template_count > 0) {
        return `/ ${this.discCategory.item_template_count} Archived`;
      }
    }
  }
}
