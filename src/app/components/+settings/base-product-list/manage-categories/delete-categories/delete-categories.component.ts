import { Component, ViewContainerRef } from '@angular/core';

import * as _ from 'lodash';
import { BSModalContext } from 'single-angular-modal/plugins/bootstrap';
import { DialogRef, ModalComponent, Overlay } from 'single-angular-modal';
import { Modal } from 'single-angular-modal/plugins/bootstrap';

import { FlashMessageService } from '../../../../services/flash-message';



export class DeleteCategoriesWindowData extends BSModalContext {
  public categories: Array<any>;
}


@Component({
  selector: 'delete-product-categories',
  templateUrl: './delete-categories.component.html',
  styleUrls: ['./delete-categories.component.scss']
})
export class DeleteProductCategoriesComponent implements ModalComponent<DeleteCategoriesWindowData>  {
  categories: Array<any> = [];
  categoriesToDelete: Array<any> = [];

  constructor(public modal: Modal,
              public dialog: DialogRef<DeleteCategoriesWindowData>) {
    setTimeout(() => {
      let categories = this.dialog.context['categories'];
      this.categoriesToDelete = _.filter(categories, {checked: true});
      this.categories = _.filter(categories, (cat) => { return !cat.checked; });
    });
  }

  ngOnInit() {
  }

  setMoveTo(category, moveToCategory) {
    if (moveToCategory)
      category.moveTo = moveToCategory.id;
  }

  close(data?) {
    if (data) {
      this.dialog.close(data);
      return;
    }
    this.dialog.dismiss();
  }

}
