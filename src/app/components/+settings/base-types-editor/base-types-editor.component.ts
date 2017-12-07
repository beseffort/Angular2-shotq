import * as _ from 'lodash';
import { Component, ViewContainerRef } from '@angular/core';
import { Modal } from 'single-angular-modal/plugins/bootstrap';
import { Overlay } from 'single-angular-modal';

import { BreadcrumbService } from '../../shared/breadcrumb/components/breadcrumb.service';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';
import { RestClientService } from '../../../services/rest-client';
import { SortPipe } from '../../../pipes/sort/sort.pipe';

interface BaseType {
  id?: number;
  name: string;
  color?: string;
}

@Component({
  templateUrl: './base-types-editor.component.html',
  styleUrls: ['../jobs/jobs.component.scss'],
  providers: [ SortPipe ]
})
export class BaseTypesEditorComponent<ModelClass extends BaseType> {
  isLoading: boolean = false;
  isArchived: boolean = false;
  isPageLoading: boolean = false;
  items: ModelClass[] = [];
  editedItem: ModelClass;
  itemName: string;
  headerItemName: string;
  hasColorPicker: boolean = true;

  constructor(
    itemName: string,
    public modal: Modal,
    public sortPipe: SortPipe,
    private overlay: Overlay,
    private vcRef: ViewContainerRef,
    private flash: FlashMessageService,
    private service: RestClientService<ModelClass>,
    private breadcrumbService: BreadcrumbService
  ) {
    this.itemName = itemName;
    let itemNameSlug = this.itemName.replace(' ', '-');
    breadcrumbService.addFriendlyNameForRoute(`/settings/${itemNameSlug}s`, '');
    overlay.defaultViewContainer = vcRef;
    this.headerItemName = _.words(this.itemName).map(_.capitalize).join(' ');
  }

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.isPageLoading = true;
    this.service
      .getList({active: !this.isArchived})
      .subscribe(
        (result) => {
          this.items = this.sortPipe.transform(result.results, 'name');
        },
        () => { this.isPageLoading = false; },
        () => { this.isPageLoading = false; }
      );
  }

  changeFilter() {
    this.isArchived = !this.isArchived;
    this.loadItems();
  }

  confirmDelete(item) {
    this.modal
      .confirm()
      .isBlocking(true)
      .showClose(false)
      .title(`Delete ${this.itemName}?`)
      .dialogClass('modal-dialog modal-confirm')
      .body(`Are you sure you want to delete ${this.itemName}? <br/> ` +
        'You will not be able to restore once deleted.')
      .okBtn('Delete')
      .okBtnClass('btn btn_xs btn_red pull-right')
      .cancelBtnClass('btn btn_xs btn_transparent')
      .open()
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            this.deleteItem(item);
          })
          .catch(() => {});
      });
  }

  deleteItem(item) {
    if (!item.id) {
      _.remove(this.items, item);
      return;
    }

    this.isLoading = true;
    this.service
      .delete(item.id)
      .subscribe(
        (result) => {
          this.isLoading = false;
          _.remove(this.items, item);
          this.flash.success(`${_.capitalize(this.itemName)} was successfully deleted.`);
        },
        () => {
          this.isLoading = false;
          this.flash.error(`Error while deleting ${this.itemName}.`);
        },
        () => { this.isLoading = false; }
      );
  }

  newItem() {
    if (_.filter(this.items, (item) => { return !item.id; }).length) {
      this.flash.error(`Please first fill all unfilled ${this.itemName}s.`);
      return;
    }

    if (_.filter(this.items, (item) => { return item['invalid'] === true; }).length) {
      this.flash.error(`Please fix all invalid ${this.itemName}s first.`);
      return;
    }

    let item = <ModelClass>{
      name: ''
    };
    this.editedItem = item;
    this.items.unshift(item);
  }

  save(item) {
    let method = !!item.id ? this.service.save : this.service.create,
      invalid;

    if (!this.itemIsEdited(item))
      return;

    invalid = this.validate(item);
    if (invalid)
      return;

    this.isLoading = true;
    method.bind(this.service)(item)
      .subscribe(
        (result: ModelClass) => {
          this.isLoading = false;
          this.editedItem = undefined;
          Object.assign(_.find(this.items, <ModelClass>{name: result.name}), result);
          this.items = this.sortPipe.transform(this.items, 'name');
          this.flash.success(`${_.capitalize(this.itemName)} saved successfully.`);
        },
        error => {
          this.flash.error(`Error saving ${this.itemName}.`);
          this.isLoading = false;
        },
        () => this.isLoading = false
      );

  }

  validate(item) {
    let similar = _.filter(this.items, <ModelClass>{name: item.name});

    if (similar.length > 1) {
      item.invalid = true;
      this.flash.error(`${this.headerItemName} already exists.`);
      return true;
    }

    item.invalid = !item.name;
    return item.invalid;
  }

  hasChanges() {
    return _.filter(this.items, item => item['invalid'] || this.itemIsEdited(item)).length;
  }

  enterEdit(item) {
    // If any item is already in edited mode, cancel it
    if (this.editedItem) {
      if (this.editedItem.id)
        this.cancelEdit(_.find(this.items, <ModelClass>{id: this.editedItem.id}));
      else {
        let newJobRole = _.find(this.items, (i) => { return !i.id; });
        newJobRole['invalid'] = true;
        this.flash.error('Please fill or remove new job role first.');
        return;
      }
    }

    this.editedItem = _.cloneDeep(item);
  }

  cancelEdit(item) {
    if (!item.id) {
      this.deleteItem(item);
      this.editedItem = undefined;
      return;
    }

    item = Object.assign(item, this.editedItem);
    this.editedItem = undefined;
  }

  itemIsEdited(item) {
    return this.editedItem && item.id === this.editedItem.id;
  }

}
