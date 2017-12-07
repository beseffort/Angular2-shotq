import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { NgModel } from '@angular/forms';
declare let require: (any);
declare let $: (any);

@Component({
  selector: 'fab-toolbar',
  providers: [NgModel],
  styleUrls: ['fab-toolbar.component.scss'],
  templateUrl: 'fab-toolbar.component.html'
})
export class FABToolbarComponent {
  @Input() actions: any;
  @Output() optionSelected = new EventEmitter<any>();
  // Main icon.
  public _icon: string = 'icon fa-ellipsis-v font-size-20';
  @Input()
  set icon(icon: string) {
    this._icon = (icon && icon.trim()) || 'icon fa-ellipsis-v font-size-20';
  }
  get icon() {
    return this._icon;
  }
  /**
   * Callback on over event
   * @param {any} e The event listener.
   */
  public over(e: any) {
    /* Get elements */
    let el = e.currentTarget.parentElement.parentElement.parentElement;
    $(e.currentTarget).children('a').addClass('op0');
    this.setUnsetVisible(el, true);
  }
  /**
   * Callback on blur event
   * @param {any} e The event listener.
   */
  public blur(e: any) {
    /* Get elements */
    let el = e.currentTarget.parentElement.parentElement.parentElement;
    $(e.currentTarget).children('a').removeClass('op0');
    this.setUnsetVisible(el, false);
  }
  /**
   * [onClick description]
   * @param {[type]} event  [description]
   * @param {[type]} action [description]
   */
  public onClick(event, action) {
    if (action.href === undefined || action.href === '#') {
      event.preventDefault();
    }
    this.optionSelected.emit(action);
    return false;
  }
  /**
   * Function to set or not visible the row in list when the toolbar appears.
   *
   * @param {any}     el      Element to iterate.
   * @param {boolean} visible boolean var to check if element should be visible or not.
   */
  private setUnsetVisible(el: any, visible: boolean) {
     if (el !== undefined) {
      let tr: any = el;
      if (tr !== undefined) {
        /* children has an array with child elements */
        for (let i = 0; i < tr.children.length - 1; i++) {
          ((visible === true) ? $(tr.children[i]).addClass('op02') : $(tr.children[i]).removeClass('op02'));
        }
      }
    }
  }
}
