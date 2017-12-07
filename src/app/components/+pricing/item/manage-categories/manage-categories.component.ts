import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ViewChild
}                     from '@angular/core';
import { NgForm }                 from '@angular/forms';
/* Services */
import { ModalService }           from '../../../../services/modal/';
import { FlashMessageService }           from '../../../../services/flash-message/';
import { ItemCategoryService }    from '../../../../services/product/item-category/item-category.service';
import { PackageCategoryService } from '../../../../services/product/package-category/package-category.service';
declare let require: (any);

@Component({
  selector: 'manage-categories',
  templateUrl: 'manage-categories.component.html',
  styleUrls: ['manage-categories.component.scss'],
  providers: [ItemCategoryService, PackageCategoryService, FlashMessageService]
})
export class ManageCategoriesComponent {
  @Input() categoryServiceType: string;
  @Input() type: string;
  @ViewChild('form') form: any;
  @Output() closeModal = new EventEmitter();

  private response: string = '';
  private componentRef;
  private editablesCategories = [];
  private categories: Array<any> = [];
  private deletedCategories: Array<any> = [];
  private createdCategories: Array<any> = [];
  private categoryPreviousName: string;
  private isLoading: boolean = false;
  private categoriesNames: Array<string> = [];
  private isValidName: boolean = true;

  private alertify = require('../../../../assets/theme/assets/vendor/alertify-js/alertify.js');

  @HostListener('document:keydown', ['$event'])
  keydown(e: KeyboardEvent) {
    if (this.editablesCategories.length === 0) {
      // check if any category are in editable status
      // if no one is editable then close modal
      if (e.key === 'Escape') {
        e.preventDefault();
        this.closeModal.emit({action: 'close'});
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.form.ngSubmit.emit();
      }
    }
  }

  constructor(private modalService: ModalService,
              private itemCategoryService: ItemCategoryService,
              private flash: FlashMessageService,
              private packageCategoryService: PackageCategoryService) {
  }

  ngOnInit() {
    this.isLoading = true;
    this.alertify.theme('bootstrap-shootq');
    this.alertify.okBtn('OK');
    this.getCategoryList();
  }

  public setComponentRef(ref) {
    this.componentRef = ref;
  }

  /**
   * Handle when input value change
   * @param {any}    e [event object]
   * @param {number} i [input index on categories array]
   */
  private valueChange(e: string, i: number) {
    if (this.categoriesNames.indexOf(e.toLowerCase()) === -1) {
      this.categories[i].name = e;
      this.isValidName = true;
    } else {
      this.isValidName = false;
    }
  }

  /**
   * delete a category
   * @param {number} i [input index on categories array]
   */
  private removeCategory(i: number) {
    let $this = this;
    this.alertify.confirm('Are you sure that you want to delete this category?', () => {
      if ($this.categories[i].id) {
        $this.isLoading = true;
        $this[this.categoryServiceType].delete($this.categories[i].id).subscribe(
          data => {
            $this.isLoading = false;
          },
          error => {
            console.error(error);
            $this.isLoading = false;
          },
          () => {
            $this.getCategoryList();
            if (this.componentRef) {
              this.componentRef.loadCategoriesAndItems(this.type);
            }
          }
        );
      } else {
        $this.categories.splice(i, 1);
      }
    });
  }

  /**
   * add a new category
   * @param {any} e [event object]
   */
  private addCategory(e: any) {
    if (this.editablesCategories.length === 0) {
      this.categories.push({name: undefined});
    }
  }

  /**
   * Handle the status of the inputs elements in order to know
   * if one of them is in editable status
   * @param {any}    e [event object]
   * @param {number} i [input index on categories array]
   */
  private handleEditableStatus(e: any, i: number) {
    if (e.isEditable) {
      this.editablesCategories.push(i);
      this.categoryPreviousName = this.categories[i].name;
    } else {
      let index = this.editablesCategories.indexOf(i);
      this.editablesCategories.splice(index, 1);
      // send POST/PUT request
      let cat = this.categories[i];
      // Name has been updated
      if (this.categoryPreviousName && cat.id && this.categoryPreviousName !== cat.name) {
        // is a PUT request
        let data = {
          pk: cat.id,
          name: cat.name,
          account: cat.account
        };
        this.isLoading = true;
        this[this.categoryServiceType].update(data).subscribe(
          () => {
            this.isLoading = false;
          },
          error => {
            console.error(error);
            this.isLoading = false;
          },
          () => {
            this.getCategoryList();
            if (this.componentRef) {
              this.componentRef.loadCategoriesAndItems(this.type);
            }
          }
        );
      } else if (!this.categoryPreviousName && !cat.id && cat.name) {
        // POST request
        let data = {
          name: cat.name
        };
        this.isLoading = true;
        this[this.categoryServiceType].create(data).subscribe(
          () => {
            this.isLoading = false;
          },
          error => {
            console.error(error);
            this.isLoading = false;
          },
          () => {
            this.getCategoryList();
            if (this.componentRef) {
              this.componentRef.loadCategoriesAndItems(this.type);
            }
          }
        );
      }
      this.categoryPreviousName = undefined;
    }
  }

  private getCategoryList() {
    this.isLoading = true;
    this[this.categoryServiceType].getList()
      .subscribe(data => {
        this.categories = data.results;
        this.categoriesNames = [];
        this.isLoading = false;
        for (let c of this.categories) {
          let n: string = c.name;
          this.categoriesNames.push(n.toLowerCase());
        }
      });
  }

  /**
   * Submit form
   * @param {NgForm} f [description]
   */
  private onSubmit(f: any) {
    if (this.isValidName && this.editablesCategories.length > 0 && this.isValid()) {
      this.closeModal.emit({action: 'close'});
    }
  }

  /**
   * Function to close modal.
   */
  private close() {
    this.closeModal.emit({action: 'close'});
  }

  /**
   * validate the category list
   * @return {boolean} [description]
   */
  private isValid(): boolean {

    let valid = true;
    for (let c of this.categories) {
      if (c.name === undefined) {
        valid = false;
        break;
      }
    }
    return valid;
  }

  /**
   * Handle invalid input event
   * display a message to user
   */
  private invalidInput() {
    this.isValidName = false;
    this.flash.error('Category name already exist');
  }
}
