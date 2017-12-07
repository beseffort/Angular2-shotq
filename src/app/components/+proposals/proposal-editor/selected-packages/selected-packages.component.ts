import * as _ from 'lodash';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Package } from '../../../../models/package';
import { PackagesFilter } from '../packages-filter';


@Component({
  selector: 'selected-packages',
  templateUrl: './selected-packages.component.html'
})
export class SelectedPackagesComponent implements OnChanges {
  @Input() packages: Package[] = [];
  @Input() packagesFilter: PackagesFilter;
  @Output() onDeletePackage: EventEmitter<Package> = new EventEmitter<Package>();
  expandedPackageId: number;
  displayPackages: number[] = [];

  ngOnChanges(changes: SimpleChanges) {
    this.updateDisplayPackages();
  }

  deletePackage(event: MouseEvent, packageItem: Package) {
    event.preventDefault();
    event.stopPropagation();
    this.onDeletePackage.emit(packageItem);
  }

  expandPackage(packageInstance: Package) {
    if (this.expandedPackageId === packageInstance.id) {
      this.expandedPackageId = null;
      return;
    }
    this.expandedPackageId = packageInstance.id;
  }

  updateDisplayPackages() {
    if (this.packagesFilter) {
      let packages = this.packages;
      if (_.isNumber(this.packagesFilter.category)) {
        packages = packages.filter(p => _.includes(p.categories, this.packagesFilter.category));
      }
      if (!!this.packagesFilter.searchQuery) {
        packages = packages.filter(p => _.includes(p.name.toLowerCase(), this.packagesFilter.searchQuery.toLowerCase()));
      }
      this.displayPackages = packages.map(p => p.id);
    } else {
      this.displayPackages = this.packages.map(p => p.id);
    }
  }
}
