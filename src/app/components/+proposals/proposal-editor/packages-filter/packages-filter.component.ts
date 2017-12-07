import * as _ from 'lodash';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PackageCategory } from '../../../../models/package-category';
import { PackagesFilter } from './packages-filter.model';


@Component({
  selector: 'packages-filter',
  templateUrl: './packages-filter.component.html'
})
export class PackagesFilterComponent implements OnInit {
  @Input() categories: PackageCategory[] = [];
  @Output() filterChanged: EventEmitter<PackagesFilter> = new EventEmitter<PackagesFilter>();
  form: FormGroup;
  filterParams: PackagesFilter = {
    searchQuery: '',
    category: null
  };

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.form = this.fb.group({
      searchQuery: [this.filterParams.searchQuery],
      category: [this.filterParams.category]
    });
    this.form.valueChanges.subscribe((changes) => {
      this.filterParams = _.assignIn(this.filterParams, changes);
      this.filterChanged.emit(this.filterParams);
    });
  }

  setCategory(category: null | number) {
    this.form.patchValue({category: category});
  }
}
