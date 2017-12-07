import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'save-changes',
  templateUrl: 'save-changes.component.html',
  styleUrls: ['save-changes.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SaveChangesComponent {

  private componentRef;

  /**
   * Set parent component ref
   * @param {[type]} ref [reference od parent component object]
   */
  public setComponentRef(ref) {
    this.componentRef = ref;
  }

}
