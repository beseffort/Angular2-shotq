import { Component, Output, EventEmitter, OnInit } from '@angular/core';
/* Services */
import { NgForm } from '@angular/forms';
import { FlashMessageService } from '../../../../services/flash-message';
/* Models */
import { Package } from '../../../../models/package';

@Component({
 selector: 'package-add',
 templateUrl: './package-add.component.html',
 styleUrls : ['./package-add.component.scss']
})
export class PackageAddComponent {
  @Output() closeModal = new EventEmitter();

  private packageModel = new Package();
  private componentRef;

  constructor(
   private flash: FlashMessageService
  ) {}

  createNewPackage() {
    let pack = {
     'name': this.packageModel.name,
    };
    // api service call
    this.flash.success('The package has been created.');
    this.closeModal.emit({action: 'modal-close'});
    this.packageModel = new Package();
  }

  /**
   * Set parent component ref
   * @param {[type]} ref [reference od parent component object]
   */
  public setComponentRef(ref) {
    this.componentRef = ref;
  }
}
