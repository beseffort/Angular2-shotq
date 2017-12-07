import { Component, ViewEncapsulation } from '@angular/core';
import { BSModalContainer } from 'single-angular-modal/plugins/bootstrap';
@Component({
  selector: 'sticky-buttons-modal-container',
  host: {
    'tabindex': '-1',
    'role': 'dialog',
    'class': 'modal fade',
    'style': 'position: absolute; display: block'
  },
  templateUrl: './sticky-buttons-modal.component.html',
  styleUrls: [
    './sticky-buttons-modal.component.scss'
  ],
  encapsulation: ViewEncapsulation.None
})

export class StickyButtonsModalContainer extends BSModalContainer {

}
