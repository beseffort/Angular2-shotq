import { NgModule } from '@angular/core';
import { StickyButtonsModalContainer } from './base-modal-components/sticky-buttons';
import { StickyButtonsModal } from './base-modal-components/sticky-buttons/sticky-buttons-modal.service';
import { ModalModule } from 'single-angular-modal';
import { CommonModule } from '@angular/common';

const MODAL_COMPONENTS = [
  StickyButtonsModalContainer
];

@NgModule({
  imports: [
    CommonModule,
    ModalModule.forRoot()
  ],
  declarations: [
    ...MODAL_COMPONENTS
  ],
  exports: [
    ...MODAL_COMPONENTS
  ],
  providers: [
    StickyButtonsModal
  ],
  entryComponents: [
    StickyButtonsModalContainer
  ]
})
export class SQModalModule {
}
