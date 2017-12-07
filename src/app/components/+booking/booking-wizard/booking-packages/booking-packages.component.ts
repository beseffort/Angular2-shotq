import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Package } from '../../../../models/package';
import { GeneralFunctionsService } from '../../../../services/general-functions/general-functions.service';


@Component({
  selector: 'booking-packages',
  templateUrl: './booking-packages.component.html',
  styleUrls: ['./booking-packages.component.scss'],
})
export class BookingPackagesComponent {
  @Input() packages: Package[];
  @Output() onPackageSelect: EventEmitter<Package> = new EventEmitter<Package>();

  constructor(private functions: GeneralFunctionsService) {

  }

  packageSelect(ppackage: Package) {
    this.onPackageSelect.emit(ppackage);
  }

  ngOnChanges() {
    if (this.packages) {
      this.functions.assignColors(this.packages);
    }

  }
}
