import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'successful-modal',
    templateUrl: './successful-modal.component.html',
    styleUrls : ['./successful-modal.component.scss']
})
export class SuccessfulModalComponent {
  @Input() redirectTo: string = 'contacts';
  @Output() closeModal = new EventEmitter();
  private componentRef;
  private router: Router;

  constructor(_router: Router) {
    this.router = _router;
  }

  /**
   * Set parent component ref
   * @param {[type]} ref [reference od parent component object]
   */
  public setComponentRef(ref) {
    this.componentRef = ref;
  }

  /**
   * Close Modal with timeout
   */
  public closeWithTimeout() {
    setTimeout(() => {
      this.modalClose();
    }, 2000);
  }

  /**
   * Close Modal
   */
  public modalClose() {
    this.closeModal.emit({action: 'modal-close'});
    this.router.navigate([this.redirectTo]);
  }
}
