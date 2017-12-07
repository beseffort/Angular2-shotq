import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute }           from '@angular/router';

import * as _ from 'lodash';
import { FileUploader, ParsedResponseHeaders } from 'ng2-file-upload';
import { FileItem } from 'ng2-file-upload/components/file-upload/file-item.class';
import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts } from 'angular-2-dropdown-multiselect';
import { overlayConfigFactory, Modal } from 'single-angular-modal';

import { BreadcrumbService }                from '../../../../components/shared/breadcrumb/components/breadcrumb.service';
import { ItemTemplateService }              from '../../../../services/product/item-template/item-template.service';
import { ItemCategoryService }              from '../../../../services/product/item-category/item-category.service';
import { ItemTemplateOptionService }        from '../../../../services/product/item-template-option/item-template-option.service';
import { ItemTemplateOptionGroupService }   from '../../../../services/product/item-template-option-group/item-template-option-group.service';
import { ItemTemplateImageService }         from '../../../../services/product/item-template-image/item-template-image.service';
import { FlashMessageService }              from '../../../../services/flash-message';
import { ApiService }                       from '../../../../services/api';
/* Models */
import { ItemCategory }                     from '../../../../models/item-category';
import { ItemTemplate }                     from '../../../../models/item-template';
import { ItemTemplateOption }               from '../../../../models/item-template-option';
import { ItemTemplateOptionGroup }          from '../../../../models/item-template-option-group';
import { ItemTemplateImage }                from '../../../../models/item-template-image';
/* Modules */
import { ITEM_TYPES, ADD_OPTIONS_ITEMS }     from './dropdown-items';
import {
  ManageCategoriesWindowData,
  ManageProductCategoriesComponent
} from '../../../+settings/base-product-list/manage-categories/manage-categories.component';

declare let require: (any);

@Component({
  selector: 'item-edit',
  templateUrl: './item-edit.component.html',
  styleUrls: ['./item-edit.component.scss'],
  providers: [ItemTemplateService, ItemCategoryService, ItemTemplateOptionService,
    ItemTemplateOptionGroupService, ItemTemplateImageService],
  encapsulation: ViewEncapsulation.None
})
export class ItemEditComponent {
  categories: IMultiSelectOption[];
  categoriesControlSettings: IMultiSelectSettings = {
    containerClasses: 'dropdown-inline sq-multiselect',
    dynamicTitleMaxItems: 2,
    checkedStyle: 'fontawesome'
  };
  categoriesControlTexts: IMultiSelectTexts = {
    defaultTitle: 'Select category'
  };
  private componentRef;
  private alertify = require('../../../../assets/theme/assets/vendor/alertify-js/alertify.js');
  private uploader: FileUploader = new FileUploader({});
  private uploaderQueue: Array<FileItem> = [];
  private images: Array<any> = [];
  private largeImage: any;
  private router: Router;
  private activatedRoute: ActivatedRoute; // Routes url params extractor.
  private itemTemplate = new ItemTemplate();
  private addOptionsItems = ADD_OPTIONS_ITEMS;
  private isNewItem = true;
  private sub: any;
  private subscriber: any;
  private isLoading = false;
  private loadMiniSpin = false;
  private loadMiniSpinId: number = -1;
  private grossProfit = 0;
  private grossProfitMargin = 0;
  private selectedItemCategories = [];
  private categoryErrors = null;
  private startUploadingCheck: boolean = false;
  private itemTypes = ITEM_TYPES;
  private newOptionsValues = {};
  private selectedType: number = 1;
  private nextUrl: string;

  private manageCategoriesModalConfig = {
    backdrop: false,
    keyboard: false,
    focus: true,
    show: false,
    ignoreBackdropClick: true
  };

  constructor(public modal: Modal,
              private breadcrumbService: BreadcrumbService,
              private itemTemplateService: ItemTemplateService,
              private itemCategoryService: ItemCategoryService,
              private itemTemplateOptionService: ItemTemplateOptionService,
              private itemTemplateOptionGroupService: ItemTemplateOptionGroupService,
              private itemTemplateImageService: ItemTemplateImageService,
              private apiService: ApiService,
              private flash: FlashMessageService,
              activatedRoute: ActivatedRoute,
              _router: Router) {
    this.router = _router;
    this.activatedRoute = activatedRoute;
    let path = null;
    let title = null;
    if (this.router.url.indexOf('pricing/items/edit') >= 0) {
      path = '/pricing/items/edit';
      title = 'Edit';
    } else {
      path = '/pricing/items/add';
      title = 'Add';
      this.itemTemplate.name = 'New Item';
    }
    breadcrumbService.addFriendlyNameForRoute(path, title);
  }

  ngOnInit() {
    /* Set alertify theme */
    this.alertify.theme('bootstrap-shootq');
    this.alertify.okBtn('OK');
    this.getCategories();

    this.sub = this.activatedRoute.params.subscribe(params => {
      this.isLoading = true;
      let id = params['id'];
      if (id) {
        this.itemTemplateService.get(id)
          .subscribe(data => {
              this.itemTemplate = data;
              this.isNewItem = false;
              let selectedType = this.itemTypes.find(t => t.slug === data.item_type);
              if (selectedType) {
                this.selectedType = selectedType.id;
              }

              for (let optionGroup of this.itemTemplate.item_template_option_groups) {
                this.setOptionLabel(optionGroup);
              }

              this.setImages();
              this.calculateGrossProfit();
              this.isLoading = false;
            },
            (err) => {
              console.error(err);
              this.flash.error('The item you are looking for doesn\'t exist');
              this.closeItemEditor();
            },
            () => this.isLoading = false);
      } else {
        this.calculateGrossProfit();
      }
    });
    this.activatedRoute
      .queryParams
      .subscribe((params) => {
        this.nextUrl = params['next'] || null;
      });
  }

  /**
   * Set parent component ref
   * @param {[type]} ref [description]
   */
  public setComponentRef(ref) {
    this.componentRef = ref;
  }

  private setImages() {
    if (this.itemTemplate.images.length > 0) {
      for (let img of this.itemTemplate.images) {
        let new_img = {
          id: img.id,
          url: img.url,
          name: img.filename,
          size: this.getImageSize(img.file_size)
        };
        this.images.push(new_img);
      }
      this.largeImage = this.images[0];
    }
  }

  /**
   * Get the image size. return a string with the file size in Kb or Mb
   * @param {number} bytes [size in bytes]
   *
   */
  private getImageSize(bytes: number): string {
    let aux = 1000;
    if (bytes < aux) {
      return '' + bytes.toFixed(1) + ' b';
    } else {
      let kb = bytes / aux;
      if (kb < aux) {
        return '' + kb.toFixed(1) + ' K';
      } else {
        let mb = kb / aux;
        return '' + mb.toFixed(1) + ' M';
      }
    }
  }

  /**
   * Get item categories
   *
   */
  private getCategories() {
    this.isLoading = true;
    this.subscriber = this.itemCategoryService.getList()
      .subscribe(categories => {
          let auxCategories = [];
          let selectedCategoryExists = false;
          for (let category of categories.results) {
            let new_category = category as ItemCategory;
            let value = new_category.name;
            value = value.replace(/_/g, ' ');
            value = value.replace(/\b\w/g, l => l.toUpperCase());
            auxCategories.push({id: new_category.id, name: value});
          }
          this.categories = auxCategories;
          if (this.itemTemplate) {
            let categoriesIds = this.categories.map(c => c.id);
            this.itemTemplate.categories = _.filter(
              this.itemTemplate.categories,
              cId => categoriesIds.indexOf(cId) !== -1
            );
          }

          // let manageCategoriesLink = {
          //   id: 0,
          //   name: 'MANAGE CATEGORIES',
          //   link: true,
          //   action: 'manage-categories'
          // };
          // this.categories.push(manageCategoriesLink);
          // if (!selectedCategoryExists) {
          //
          //   this.selectedCategory = undefined;
          // }
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
   * Set the Option Type Label shown, depends of option type
   * @param {ItemTemplateOptionGroup} optionGroup [option group to set label for]
   */
  private setOptionLabel(optionGroup: ItemTemplateOptionGroup) {
    switch (optionGroup.option_type) {
      case 'drop':
        optionGroup.option_type_label = 'Selection List';
        break;
      case 'check':
        optionGroup.option_type_label = 'Option';
        break;
      case 'single':
        optionGroup.option_type_label = 'Single Line';
        break;
      case 'multi':
        optionGroup.option_type_label = 'Multi Line';
        break;
      default:
        break;
    }
  }

  /**
   * Handle event emited when image is added to the item template
   * @param {any} e [image data]
   */
  private addImage(response: any) {
    let image = response.image;
    this.uploader = response.uploader;

    this.images.push(image);

    if (this.uploader && this.uploader.queue.length > 0) {
      this.uploaderQueue.push(this.uploader.queue[0]);
    }
    this.largeImage = this.images[0];
  }

  /**
   * Delete item template image
   * @param {any}    e [image data]
   * @param {number} i [array index]
   */
  private deleteImage(i: number) {
    if (this.isNewItem) {
      this.images.splice(i, 1);
    } else {
      // check if it was saved on db or is new and is on uploader queue
      let found = false;
      for (let j = 0; j < this.uploaderQueue.length; j++) {
        if (this.uploaderQueue[j].file.name === this.images[i].name) {
          this.uploaderQueue.splice(j, 1);
          found = true;
          break;
        }
      }

      // if it was not found on queue to upload, then it is already saved on db
      let $this = this;
      if (!found) {
        if (this.images[i].id) {
          this.alertify.confirm(
            'Are you sure that you want to perform this action? The image is going to be deleted from database and it is not reversible.',
            function () {
              $this.isLoading = true;
              let response = null;
              $this.itemTemplateImageService.delete($this.images[i].id)
                .subscribe(res => {
                    response = res;
                    // delete from shown list
                    $this.images.splice(i, 1);
                    $this.flash.success('The image has been deleted.');
                  },
                  err => {
                    $this.flash.error('An error has occurred deleting the image, please try again later.');
                  },
                  () => $this.isLoading = false
                );
            });
        }
      } else {
        // delete from shown list
        this.alertify.confirm(
          'Are you sure that you want to perform this action?',
          function () {
            $this.images.splice(i, 1);
          });
      }
    }
  }

  /**
   * Handle event emited to associate the saved image file to the item
   * @param {any}    e [image data]
   *
   */
  private associateSavedImage(response: any) {
    this.isLoading = true;
    if (response && response.hasOwnProperty('file_id') && response.hasOwnProperty('url')) {
      let itemImage = new ItemTemplateImage();
      itemImage.image = response.file_id;
      itemImage.item_template = this.itemTemplate.id;
      itemImage.sequence = 1;
      itemImage.url = response.url;

      let resp = null;
      this.itemTemplateImageService.create(itemImage)
        .subscribe(img => {
            resp = img;
          },
          err => {
            this.flash.error('An error has occurred associating the image file with the item, please try again later.');
            this.isLoading = false;
          },
          () => {
          }
        );
    } else {
      console.error('Error trying to save the file');
      this.isLoading = false;
    }
  }

  /**
   * Add new item option
   * @param {any}    e [event]
   */
  private addOption(e) {
    this.isLoading = true;

    let optionGroup = new ItemTemplateOptionGroup();
    let option = new ItemTemplateOption();

    if (this.itemTemplate.id) {
      optionGroup.item_template = this.itemTemplate.id;
    }

    switch (e.type) {
      case 'drop':
        optionGroup.option_type = 'drop';
        optionGroup.option_type_label = 'Selection List';
        break;
      case 'single':
        optionGroup.option_type = 'single';
        optionGroup.option_type_label = 'Single Line';
        break;
      case 'multi':
        optionGroup.option_type = 'multi';
        optionGroup.option_type_label = 'Multi Line';
        break;
      case 'check':
        optionGroup.option_type = 'check';
        optionGroup.option_type_label = 'Option';
        break;
      default:
        break;
    }

    let _optionGroup = new ItemTemplateOptionGroup;

    // first we must create the option group on db, and then associate the new option to it
    this.itemTemplateOptionGroupService.create(optionGroup)
      .subscribe(newOptionGroup => {
          _optionGroup = newOptionGroup;

          // create a new option on the recently option group created
          let newOpt = new ItemTemplateOption;
          option.group = _optionGroup.id;
          this.itemTemplateOptionService.create(option)
            .subscribe(_newOpt => {
                newOpt = _newOpt;
                _optionGroup.item_template_options.push(newOpt);
                this.setOptionLabel(_optionGroup);
                this.itemTemplate.item_template_option_groups.push(_optionGroup);
                this.flash.success('The item option has been created.');
              },
              err => {
                this.flash.error('An error has occurred creating the item option, please try again later.');
              },
              () => this.isLoading = false
            );
        },
        err => {
          this.flash.error('An error has occurred creating the item option, please try again later.');
          this.isLoading = false;
        }
      );
  }

  /**
   * Modal confirmation to Delete item option
   * @param {number} optionIdx [Index of item option]
   * @param {number} valueIdx [index of option value]
   */
  private confirmDeleteOptionValue(optionIdx: number, valueIdx: number) {
    this.alertify.confirm('Are you sure that you want to perform this action?',
      () => {
        this.deleteOptionValue(optionIdx, valueIdx);
      });
  }

  /**
   * Delete item option
   * @param {number} optionIdx [Index of item option]
   * @param {number} valueIdx [index of option value]
   */
  private deleteOptionValue(optionIdx: number, valueIdx: number) {
    this.loadMiniSpin = true;
    this.loadMiniSpinId = optionIdx;
    let itemOptionGroup = this.itemTemplate.item_template_option_groups[optionIdx];
    if (itemOptionGroup.item_template_options[valueIdx].id) {
      let deleteResponse = null;
      this.itemTemplateOptionService.delete(
        itemOptionGroup.item_template_options[valueIdx].id
      )
        .subscribe(deleted => {
            deleteResponse = deleted;
            this.flash.success('The item option has been deleted.');
            // if this is the last itemoption delete the option

            itemOptionGroup.item_template_options.splice(valueIdx, 1);

            // check if the option group has no values, then delete it
            if (itemOptionGroup.item_template_options.length === 0) {
              if (itemOptionGroup.id) {
                let deleteResponseGroup = null;
                this.itemTemplateOptionGroupService.delete(itemOptionGroup.id)
                  .subscribe(deletedGroup => {
                      deleteResponseGroup = deletedGroup;
                    },
                    err => {
                      this.flash.error('An error has occurred deleting the item group, please try again later.');
                    },
                    () => this.loadMiniSpin = false
                  );
              } else {
                this.loadMiniSpin = false;
                this.loadMiniSpinId = -1;
              }
              // delete from the item options table
              this.itemTemplate.item_template_option_groups.splice(optionIdx, 1);
            } else {
              this.loadMiniSpin = false;
              this.loadMiniSpinId = -1;
            }
          },
          err => {
            this.flash.error('An error has occurred deleting the item option, please try again later.');
          },
          () => {
          }
        );
    }
  }

  /**
   * Add new value to an item option
   * @param {number} optionIdx [Index of item option]
   */
  private addOptionValue(index: number) {
    this.isLoading = true;
    let new_name = (<HTMLInputElement>document.getElementById('new-value-name-' + index.toString())).value;

    if (new_name !== undefined && new_name !== '') {
      let new_price = (<HTMLInputElement>document.getElementById('new-value-price-' + index.toString())).value;
      let new_cogs = (<HTMLInputElement>document.getElementById('new-value-cogs-' + index.toString())).value;

      let newVal = new ItemTemplateOption();
      newVal.account = 1;
      if (new_price) {
        newVal.extra_price = parseFloat(new_price);
      }
      if (new_cogs) {
        newVal.extra_cogs = parseFloat(new_cogs);
      }
      newVal.name = new_name;
      newVal.showDelete = false;

      if (this.itemTemplate.item_template_option_groups[index].id) {
        newVal.group = this.itemTemplate.item_template_option_groups[index].id;
      }

      if (!this.isNewItem) {
        let response = null;
        this.itemTemplateOptionService.create(newVal)
          .subscribe(newValue => {
              response = newValue;
              this.itemTemplate.item_template_option_groups[index].item_template_options.push(response);
              this.flash.success('The item option has been created.');
            },
            err => {
              this.flash.error('An error has occurred creating the item, please try again later.');
            },
            () => this.isLoading = false
          );
      } else {
        this.itemTemplate.item_template_option_groups[index].item_template_options.push(newVal);
        this.isLoading = false;
      }

      new_name = null;
      new_price = null;
      new_cogs = null;
    }
  }

  /**
   * Save item on database
   *
   */
  private save() {
    this.isLoading = true;

    this.uploader.queue = this.uploaderQueue;


    let itemTemp = new ItemTemplate();
    itemTemp = _.cloneDeep(this.itemTemplate);

    // delete option type label and showDelete from final itemTemplate structure
    for (let optionGroup of itemTemp.item_template_option_groups) {
      delete optionGroup.option_type_label;
      for (let option of optionGroup.item_template_options) {
        delete option.showDelete;
      }
    }

    if (!itemTemp.categories) {
      this.categoryErrors = 'Please, select category for the item';
      this.flash.error('Please, select category for the item');
      this.isLoading = false;
      return;
    }

    let response;
    if (this.isNewItem) {
      this.itemTemplateService.create(itemTemp)
        .subscribe(newItem => {
            response = newItem;
            this.itemTemplate.id = response.id;
            if (this.uploader.queue.length === 0) {
              this.isLoading = false;
              this.flash.success('The item has been created.');
              this.closeItemEditor();
            } else {
              // upload images
              this.uploadNewImages();
            }
          },
          err => {
            this.flash.error('An error has occurred creating the item, please try again later.');
            this.isLoading = false;
          },
          () => this.closeItemEditor()
        );
    } else {
      this.itemTemplateService.save(itemTemp)
        .subscribe(updateItem => {
            response = updateItem;
            if (this.uploader.queue.length === 0) {
              this.isLoading = false;
              this.flash.success('The item has been updated.');
              this.closeItemEditor();
            } else {
              // upload images
              this.uploadNewImages();
            }
          },
          err => {
            this.flash.error('An error has occurred updating the item, please try again later.');
            this.isLoading = false;
          },
          () => this.closeItemEditor()
        );
    }
  }

  /**
   * Show delete button when over an item option value
   * @param {any} value [item option value]
   * @param {string} action ['enter' or 'leave', to set button visible or not]
   */
  private showDeleteButton(value: any, action: string) {
    if (action === 'enter') {
      value.showDelete = true;
    } else {
      value.showDelete = false;
    }
  }

  /**
   * Calculate gross profit and gross profit margin
   *
   */
  private calculateGrossProfit() {
    let price = parseFloat(this.itemTemplate.price);
    let cogs = parseFloat(this.itemTemplate.cost_of_goods_sold);
    let grossProfit = 0;
    let grossProfitMargin = 0;

    if (!isNaN(price) && !isNaN(cogs)) {
      grossProfit = (price - cogs);
    }

    if (price !== 0 && !isNaN(price)) {
      grossProfitMargin = (grossProfit / price);
    }

    this.grossProfit = grossProfit;
    this.grossProfitMargin = grossProfitMargin;
  }

  /**
   * Handle select of Item Types
   * @param {any} e [description]
   */
  private selectType(e: any) {
    this.selectedType = e;
    // e is the ITEM_TYPES id of the type
    // as ITEM_TYPES isn't come from API
    // (e - 1) is the position in the array
    this.itemTemplate.item_type = this.itemTypes[(this.selectedType - 1)].slug;
  }

  private closeItemEditor() {
    if (this.nextUrl) {
      this.router.navigateByUrl(this.nextUrl);
    } else {
      this.router.navigate(['/settings', 'products', 'items']);
    }
  }

  /**
   * Set the large image when mouse pass over an image
   * @param {any}    e   [description]
   * @param {[type]} img [description]
   */
  private onMouseOverImage(e: any, img) {
    this.largeImage = img;
  }

  /**
   * Add a new option item
   * @param {[type]} index [description]
   */
  private addNewOptionValue(index) {
    let option = new ItemTemplateOption();
    option.group = this.itemTemplate.item_template_option_groups[index].id;
    this.loadMiniSpin = true;
    this.loadMiniSpinId = index;
    this.itemTemplateOptionService.create(option)
      .subscribe(_newOpt => {
          let newOpt = _newOpt;
          this.itemTemplate.item_template_option_groups[index].item_template_options.push(newOpt);
          this.flash.success('The item option has been created.');
        },
        err => {
          this.flash.error('An error has occurred creating the item option, please try again later.');
        },
        () => {
          this.loadMiniSpin = false;
          this.loadMiniSpinId = -1;
        }
      );
  }

  /**
   * Open Manage Categories modal
   */
  private openManageCategoriesModal() {
    this.modal
      .open(ManageProductCategoriesComponent, overlayConfigFactory({
        categoriesService: this.itemCategoryService
      }, ManageCategoriesWindowData))
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
          })
          .catch(() => {
          });
      });
  }

  private uploadNewImages() {
    this.startUploadingCheck = true;
    this.uploader.onCompleteItem = (item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
      this.associateSavedImage(JSON.parse(JSON.parse(response)));
    };
    this.uploader.onCompleteAll = () => {
      this.startUploadingCheck = false;
      this.isLoading = false;
      if (this.isNewItem) {
        this.flash.success('The item has been created.');
      } else {
        this.flash.success('The item has been updated.');
      }
      this.closeItemEditor();
    };
    for (let fileItem of this.uploader.queue) {
      fileItem.withCredentials = false;
      fileItem.upload();
    }
  }

  private close() {
    this.router.navigate(['pricing/items']);
  }
}
