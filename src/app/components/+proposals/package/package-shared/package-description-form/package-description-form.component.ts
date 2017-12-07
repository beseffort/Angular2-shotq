import {
  Component, OnInit, OnChanges,
  Output, Input, EventEmitter,
  SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts } from 'angular-2-dropdown-multiselect';
import { BasePackage } from '../../../../../models/base-package';
import { PackageCategoryService } from '../../../../../services/product/package-category';


interface PackageTemplateDescription {
  name: string;
  description?: string;
}

@Component({
  selector: 'package-description-form',
  templateUrl: 'package-description-form.component.html'
})
export class PackageDescriptionFormComponent implements OnInit, OnChanges {
  form: FormGroup;
  packageCategories: IMultiSelectOption[] = [];
  categoriesControlSettings: IMultiSelectSettings = {
    containerClasses: 'dropdown-inline sq-multiselect',
    dynamicTitleMaxItems: 6,
    checkedStyle: 'fontawesome'
  };
  categoriesControlTexts: IMultiSelectTexts = {
    defaultTitle: 'Select category'
  };
  @Input() package: BasePackage;
  @Output() descriptionUpdated: EventEmitter<PackageTemplateDescription> = new EventEmitter<PackageTemplateDescription>();

  constructor(
    private fb: FormBuilder,
    private packageCategoryService: PackageCategoryService) { }

  ngOnInit() {
    this.form = this.fb.group({
      name: [this.package.name || '', Validators.required],
      description: [this.package.description || ''],
      categories: [this.package.categories || []]
    });
    this.packageCategoryService.getList().subscribe((response) => {
      this.packageCategories = response.results.map((c) => {
        return {id: c.id, name: c.name};
      });
    });
    this.form.valueChanges.subscribe((data) => {
      this.descriptionUpdated.emit(data);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.form && changes && changes['package']) {
      this.form.patchValue({
        name: this.package.name,
        description: this.package.description,
        categories: this.package.categories
      });
    }
  }
}
