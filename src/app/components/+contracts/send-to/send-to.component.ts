import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'send-to',
  templateUrl: 'send-to.component.html',
  styleUrls: ['send-to.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SendToComponent {

  private componentRef;

  /**
   * Set parent component ref
   * @param {[type]} ref [reference od parent component object]
   */
  public setComponentRef(ref) {
    this.componentRef = ref;
  }
}
