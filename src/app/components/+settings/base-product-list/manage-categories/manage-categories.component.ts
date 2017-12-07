import { Component } from '@angular/core';

import * as _ from 'lodash';
import { BSModalContext } from 'single-angular-modal/plugins/bootstrap';
import { DialogRef, ModalComponent, overlayConfigFactory } from 'single-angular-modal';
import { Modal } from 'single-angular-modal/plugins/bootstrap';
import { Observable } from 'rxjs/Observable';

import { FlashMessageService } from '../../../../services/flash-message';
import { CURRENT_PROFILE_ID } from '../../../../services/access/access.service';
import {
  DeleteCategoriesWindowData,
  DeleteProductCategoriesComponent
} from './delete-categories/delete-categories.component';
import { RestClientService } from '../../../../services/rest-client/rest-client.service';



export class ManageCategoriesWindowData extends BSModalContext {
  public categoriesService: RestClientService<any>;
}


@Component({
  selector: 'manage-product-categories',
  templateUrl: './manage-categories.component.html',
  styleUrls: ['./manage-categories.component.scss']
})
export class ManageProductCategoriesComponent implements ModalComponent<ManageCategoriesWindowData>  {
  categories: Array<any> = [];
  modifiedCategories: Array<any> = [];

  categoriesService: any;

  isEditing: boolean = false;
  isLoading: boolean = false;
  canDelete: boolean = false;

  constructor(private flash: FlashMessageService,
              public modal: Modal,
              public dialog: DialogRef<ManageCategoriesWindowData>) {
  }

  ngOnInit() {
    this.isLoading = true;

    this.categoriesService = this.dialog.context['categoriesService'];
    this.categoriesService
      .getList({is_fake: false})
      .subscribe(
        (result) => {
          this.isLoading = false;
          this.categories = result.results.map((item) => {
            item.checked = false;
            item.template_count = item.item_template_count === undefined ?
              item.package_template_count : item.item_template_count;
            return item;
          });
        },
        error => {
          this.isLoading = false;
        },
        () => this.isLoading = false
      );
  }

  addCategory() {
    let unfilledCategories = _.filter(this.categories, {name: undefined});
    if (unfilledCategories.length) {
      this.flash.error('Please fill all unfilled categories first.');
      return;
    }

    this.categories.push({name: undefined, account: CURRENT_PROFILE_ID});
  }

  create(category) {
    if (!category.name) {
      this.flash.error('Please fill category name first.');
      return;
    }

    this.validateUnique(category);
    if (category.invalid)
      return;

    this.categoriesService
      .create(category)
      .subscribe((res) => {
          Object.assign(category, res);
          this.isLoading = false;
          this.flash.success('Category is successfully saved.');
        }, error => {
          this.flash.error('Error saving category.');
          this.isLoading = false;
        }, () => this.isLoading = false);
  }

  update() {
    return Observable.create(observer => {
      if (!this.modifiedCategories.length) {
        observer.next([]);
        observer.complete();
      } else {
        this.categoriesService
          .bulkUpdate(this.modifiedCategories)
          .subscribe(res => {
            observer.next(res);
            observer.complete();
          });
      }
    });
  }

  confirmDelete() {
    this.modal
      .confirm()
      .isBlocking(true)
      .showClose(false)
      .title('Delete categories?')
      .dialogClass('modal-dialog modal-confirm')
      .body('Are you sure you want to delete categories? <br/> ' +
        'You will not be able to restore once deleted.')
      .okBtn('Delete')
      .okBtnClass('btn btn_xs btn_red pull-right')
      .cancelBtnClass('btn btn_xs btn_transparent')
      .open()
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            this.showDeleteModal();
          })
          .catch(() => {});
      });
  }

  showDeleteModal() {
    let categoriesToDelete = _.filter(this.categories, {checked: true}),
      notEmptyCategories = _.filter(categoriesToDelete, (cat) => { return !!cat['template_count']; });

    // If all categories are empty, we don't need to show modal with Move functionality
    if (!notEmptyCategories.length) {
      categoriesToDelete.forEach((category) => {
        this.delete(category);
      });
      return;
    }

    this.modal
      .open(DeleteProductCategoriesComponent, overlayConfigFactory({
        categories: this.categories
      }, DeleteCategoriesWindowData))
      .then(dialogRef => {
        dialogRef.result
          .then(result => {
            result.forEach((category) => {
              this.delete(category);
            });
          })
          .catch(() => {
          });
      });
  }

  delete(category) {
    this.categoriesService
      .itemPost(category.id, 'delete', {move_to: category.moveTo})
      .subscribe((result) => {
          this.isLoading = false;
          this.close({hasChanges: true});
          this.flash.success(`Category was successfully deleted: ${category.name}.`);
        }, error => {
          this.flash.error(`Failed to delete category: ${category.name}.`);
          this.isLoading = false;
        }, () => this.isLoading = false);
  }

  save() {
    let unfilledCategories = _.filter(this.categories, {name: undefined});
    if (unfilledCategories.length) {
      this.flash.error('Please fill all unfilled categories first.');
      return;
    }

    this.isLoading = true;
    this.update()
      .subscribe((res) => {
          this.isLoading = false;
          this.close({hasChanges: true});
          this.flash.success('Changes was successfully saved.');
        }, error => {
          this.flash.error('Error saving data.');
          this.isLoading = false;
        }, () => this.isLoading = false);

  }

  removeFromList(category) {
    _.remove(this.categories, category);
  }

  onCategoryModified(category) {
    // If category is new, we don't need to update it, just create
    if (!category.id)
      return;

    let index = _.findIndex(this.modifiedCategories, {id: category.id});
    if (index === -1)
      this.modifiedCategories.push(category);
  }

  checkCanDelete() {
    let selectedCategories = _.filter(this.categories, {checked: true});
    this.canDelete = !!selectedCategories.length;
  }

  validateUnique(category) {
    let similarCategories = _.filter(this.categories, {name: category.name});

    if (similarCategories.length > 1) {
      category.invalid = true;
      this.flash.error('Such category name already exists.');
      return;
    }

    category.invalid = !category.name;
  }

  valid() {
    let invalidCategories = _.filter(this.categories, {invalid: true}),
      unfilledCategories = _.filter(this.categories, {name: undefined});
    return !invalidCategories.length && !unfilledCategories.length;
  }

  close(data?) {
    if (data) {
      this.dialog.close(data);
      return;
    }
    this.dialog.dismiss();
  }

}
