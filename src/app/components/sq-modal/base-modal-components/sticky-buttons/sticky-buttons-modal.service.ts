import { Injectable } from '@angular/core';
import { CSSBackdrop, Modal, Overlay, PromiseCompleter } from 'single-angular-modal';
import { StickyButtonsModalContainer } from './sticky-buttons-modal.component';


@Injectable()
export class StickyButtonsModal extends Modal {

  constructor(overlay: Overlay) {
    super(overlay);
  }


  create(dialogRef, content, bindings) {
    let backdropRef = this.createBackdrop(dialogRef, CSSBackdrop);
    // TODO: Move getting container class to base method
    let containerRef = this.createContainer(dialogRef, StickyButtonsModalContainer, content, bindings);
    let overlay = dialogRef.overlayRef.instance;
    let backdrop = backdropRef.instance;
    let container = containerRef.instance;
    dialogRef.inElement ? overlay.insideElement() : overlay.fullscreen();
    // add body class if this is the only dialog in the stack
    if (!document.body.classList.contains('modal-open')) {
      document.body.classList.add('modal-open');
    }
    if (dialogRef.inElement) {
      backdrop.setStyle('position', 'absolute');
    }
    backdrop.addClass('modal-backdrop fade', true);
    backdrop.addClass('in');
    container.addClass('in');
    if (containerRef.location.nativeElement) {
      containerRef.location.nativeElement.focus();
    }
    overlay.beforeDestroy(() => {
      let completer = new PromiseCompleter();
      backdrop.removeClass('in');
      container.removeClass('in');
      backdrop.myAnimationEnd$()
        .combineLatest(container.myAnimationEnd$(), (s1, s2) => [s1, s2])
        .subscribe((sources) => {
          if (this.overlay.groupStackLength(dialogRef) === 1) {
            document.body.classList.remove('modal-open');
          }
          completer.resolve();
        });
      return completer.promise;
    });
    return dialogRef;

  }
}
