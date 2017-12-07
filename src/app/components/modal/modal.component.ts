import {
  Component,
  ViewChild,
  Input,
  OnInit,
  Output,
  EventEmitter,
  Compiler,
  AfterViewInit
}                               from '@angular/core';
import { ModalDirective }       from 'ngx-bootstrap';
import { DynamicModalContent }  from './../../directives/dynamic-modal-content/';
// Services
import { ModalService }         from '../../services/modal';

@Component({
  selector: 'modal',
  templateUrl: 'modal.component.html',
  styleUrls: ['./modal.component.scss'],
  exportAs: 'modal-instance'
})
export class ModalComponent implements OnInit {

  @Input() title: string;
  @Input() cssClass: String;
  @Input() bodyCssClass: String;
  @Input() config: any = {
      backdrop: 'static',
      keyboard: true,
      focus: true,
      show: false,
      ignoreBackdropClick: false,
    };
  @Input('close') closeButton: boolean = false;
  @ViewChild('bsModalInstance') public bsModalInstance: ModalDirective;
  @ViewChild('dynamicModalContent') public dynamicModalContent: DynamicModalContent;

  @Output() templateChange = new EventEmitter();
  @Output() closeModal = new EventEmitter();
  @Output() openModal = new EventEmitter();
  @Output() hiddenModal = new EventEmitter();

  container1: HTMLElement;
  canSubmit: boolean = true;

  private templateModule = undefined;
  private submitButtonText: string;
  private showBottomBar: boolean = true;
  private showNewModal: boolean = false;
  private screenHeight: number;
  private showLogo: boolean = true;
  private updateContent = 1;
  private footerCssClass = '';

  constructor(private modalService: ModalService, private compiler: Compiler) {
  }

  ngOnInit() {
    this.modalService.setModalRef(this);
    this.bsModalInstance.onHide.subscribe(event => {
      this.closeModal.emit(event);
      // this.showBottomBar = false;
      this.showNewModal = false;
    });
    this.bsModalInstance.onShown.subscribe(event => {
      this.openModal.emit(event);
      this.calculateScreenHeight();
    });
    this.bsModalInstance.onHidden.subscribe(event => {
      this.hiddenModal.emit(event);
    });
  }
  ngAfterViewInit() {
    if (this.config.show) {
      this.show();
    }
  }

  /**
   * Open modal
   */
  public show(greyBackdrop?: boolean) {
    this.bsModalInstance.show();
    if (greyBackdrop) {
      this.setGreyBackdrop();
    }
  }

  /**
   * Hide modal
   */
  public hide(): void {
    // this.showBottomBar = false;
    this.bsModalInstance.hide();
    this.setDefaultBackdrop();
  }

  /**
   * Hide Footer
   */
  public hideFooter() {
    this.showBottomBar = false;
  }

  /**
   * set modal title
   * @param {string} title [modal title]
   */
  public setTitle(title: string) {
    this.title = title;
  }

  /**
   * Set modal CSS class
   * @param {string} style [css class]
   */
  public setCssClass(style: string) {
    this.cssClass = style;
    if (style !== undefined && style !== '') {
      this.footerCssClass = style + 'Footer';
    }
  }

  /**
   * Set modal body CSS class
   * @param {string} style [css class]
   */
  public setBodyCssClass(style: string) {
    this.bodyCssClass = style;
  }

  /**
   * Set the component to be loaded
   * @param {[type]} component [description]
   */
  public setModalContent(template) {
    this.templateModule = template;
    // Change the flag updateContent to force the re draw of the modal
    this.updateContentValue();
  }

  public reload() {
    this.updateContentValue();
  }

  /**
   * Disable keyboard event listener
   */
  public disableKeyboardListener() {
    this.config.keyboard = false;
  }

  /**
   * Enables keyboard event listener
   */
  public enableKeyboardListener() {
    this.config.keyboard = true;
  }

  /**
   * Handle the onChangeTemplate event
   * Emits an templateChange event with the event data
   * @param {[type]} event [event recibed from templateChangeEvent from DynamicModalContentComponent]
   */
  private onChangeTemplate(event) {
    this.templateChange.emit(event);
  }

  /**
   * Set if new modal style is shown and the text of the submit button from bottom-bar
   * @param {string} submitText [text to show on submit button]
   * @param {boolean} showNewModal [modal is shown with new style]
   * @param {boolean} showBottomBar [footer bar is shown with new style]
   */
  private setModalFooterBar(submitText: string, showNewModal: boolean, options: any = {}) {
    this.submitButtonText = submitText;
    this.showNewModal = showNewModal;
    if (options['canSubmit'] !== undefined) {
      this.canSubmit = options['canSubmit'];
    }
  }

  /**
   * Function to get the submit button from the dynamic form and submit it
   */
  private submitForm() {
    let button = document.getElementById('submitButton');
    if (button) {
      button.click();
    }
  }

  /**
   * Function to get the cancel button from the dynamic form
   */
  private cancelForm() {
    let button = document.getElementById('cancelButton');
    if (button) {
      button.click();
    } else {
      this.hide();
    }
  }

  /**
   * Function to get the window height
   */
  private calculateScreenHeight() {
    this.screenHeight = window.innerHeight;
    this.container1 = document.getElementById('container-1');
    if (this.container1) {
      this.container1.style.height = (this.screenHeight - 2).toString() + 'px';
    }
  }

  private setGreyBackdrop() {
    this.showLogo = false;
    jQuery('.modal-backdrop')[0].classList.add('modal-backdrop_grey');
  }

  private setDefaultBackdrop() {
    this.showLogo = true;

    let backdrop = jQuery('.modal-backdrop')[0];
    if (backdrop) {
      backdrop.classList.remove('modal-backdrop_grey');
    }
  }

  private updateContentValue() {
    this.updateContent++;
    // just prevent to updateContent get higher values
    if (this.updateContent > 1000) {
      this.updateContent = 0;
    }
  }
}
