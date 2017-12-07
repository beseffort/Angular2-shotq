import {
  Component, Input, Output,
  EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Location } from '@angular/common';
import { PackageTemplate } from '../../../../models/package-template';
import { Package } from '../../../../models/package';


@Component({
  selector: 'package-templates',
  templateUrl: 'package-templates.component.html'
})
export class PackageTemplatesComponent implements OnInit, OnChanges {
  expandedPackageId: number = null;
  selectedTemplatesIds: number[] = [];
  currentPath: string;
  @Input() packages: PackageTemplate[] = [];
  @Input() selectedPackages: Package[] = [];
  @Output() addPackage: EventEmitter<PackageTemplate> = new EventEmitter<PackageTemplate>();

  constructor(private location: Location) { }

  ngOnInit() {
    this.currentPath = this.location.path();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['packages']) {
      let selectedPackage = this.packages.find(p => p.id === this.expandedPackageId);
      if (!selectedPackage) {
        this.expandedPackageId = null;
      }
    }
    if (changes['selectedPackages']) {
      this.selectedTemplatesIds = this.selectedPackages.map(p => p.template);
    }
  }

  togglePackage(packageTemplate: PackageTemplate) {
    if (this.expandedPackageId === packageTemplate.id) {
      this.expandedPackageId = null;
    } else {
      this.expandedPackageId = packageTemplate.id;
    }
  }

  addToProposal(event: MouseEvent, packageTemplate: PackageTemplate) {
    event.preventDefault();
    event.stopPropagation();
    this.addPackage.emit(packageTemplate);
  }

  addToProposalAndEditPackage(event: MouseEvent, packageTemplate: PackageTemplate) {
    event.preventDefault();
    event.stopPropagation();
    packageTemplate.$openOnEdit = true;
    this.addPackage.emit(packageTemplate);
  }
}
