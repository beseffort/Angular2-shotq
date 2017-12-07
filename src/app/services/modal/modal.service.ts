import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs';

@Injectable()
export class ModalService {
  public templateChange: Observable<any>;
  public openModal: Observable<any>;
  public closeModal: Observable<any>;
  public hiddenModal: Observable<any>;
  public onHide: Subject<any> = new Subject<any>();

  public data: any;

  private modalRef;
  private parentRef;
  private blur;
  private callback;
  private templateChangeSubscriber: any;
  private openModalSubscriber: any;
  private closeModalSubscriber: any;
  private hiddenModalSubscriber: any;

  private closeModalSubs: any;
  private openModalSubs: any;
  private hiddenModalSubs: any;


  constructor() {
    this.templateChange = new Observable();
    this.openModal = new Observable();
    this.closeModal = new Observable();
    this.hiddenModal = new Observable();
    window['addHash'] = true;
  }
  /**
   * Set modal reference to handle the show and hide modal methods
   * @param {[type]} ref [reference to modal component]
   */
  public setModalRef(ref) {
    this.modalRef = ref;
    window['modalRef'] = ref;
    this.templateChange = this.modalRef.templateChange;
    this.openModal = this.modalRef.openModal;
    this.closeModal = this.modalRef.closeModal;
    this.hiddenModal = this.modalRef.hiddenModal;

    if (this.closeModalSubs !== undefined) {
      this.closeModalSubs.unsubscribe();
      this.closeModalSubs = undefined;
    }
    this.closeModalSubs = this.modalRef.closeModal
      .subscribe(ev => {
        let el = document.getElementById('wrapper');
        if (el) {
          el.className = '';
        }
        let url = location.hash;
        window.removeEventListener('hashchange', this.urlChange);
        location.hash = url.replace('?modalOpen', '');
      });
    this.openModalSubs = this.modalRef.openModal
      .subscribe(ev => {
        let el = document.getElementById('wrapper');
        if (this.blur) {
          el.className = 'show-blur';
        }
    });
    if (this.openModalSubs !== undefined) {
      this.openModalSubs.unsubscribe();
      this.openModalSubs = undefined;
    }
  }
  public urlChange () {
    if (document.querySelectorAll('.modal.fade.in').length > 0) {
        if (window['addHash'] === true) {
            window['modalRef'].hide();
        }
    }
  }
  /**
   * set the subscriber for the templateChange observable
   * @param {any} subscriber [description]
   */
  public subscribeTemplateChange(subscriber: any) {
    this.templateChangeSubscriber = subscriber;
  }
  /**
   * unsubscribe the subscriber of the templateChange obsevable
   */
  public unsubscribeTemplateChange() {
    if (this.templateChangeSubscriber) {
      this.templateChangeSubscriber.unsubscribe();
    }
  }
  /**
   * set the subscriber for the templateChange observable
   * @param {any} subscriber [description]
   */
  public subscribeOpenModal(subscriber: any) {
    this.openModalSubscriber = subscriber;
  }
  /**
   * unsubscribe the subscriber of the templateChange obsevable
   */
  public unsubscribeOpenModal() {
    if (this.openModalSubscriber) {
      this.openModalSubscriber.unsubscribe();
    }
  }
  /**
   * set the subscriber for the templateChange observable
   * @param {any} subscriber [description]
   */
  public subscribeCloseModal(subscriber: any) {
    this.closeModalSubscriber = subscriber;
  }
  /**
   * unsubscribe the subscriber of the templateChange obsevable
   */
  public unsubscribeCloseModal() {
    if (this.closeModalSubscriber) {
      this.closeModalSubscriber.unsubscribe();
    }
  }

  /**
   * set the subscriber for the templateChange observable
   * @param {any} subscriber [description]
   */
  public subscribeHiddenModal(subscriber: any) {
    this.hiddenModalSubscriber = subscriber;
  }
  /**
   * unsubscribe the subscriber of the templateChange obsevable
   */
  public unsubscribeHiddenModal() {
    if (this.hiddenModalSubscriber) {
      this.hiddenModalSubscriber.unsubscribe();
    }
  }

  public getModalRef() {
    return this.modalRef;
  }
  /**
   * displays modal
   * @param {boolean} blur [flag to display or not the blur effect]
   * @param {boolean} grey [flag to switch modal backdrop to grey color]
   */
  public showModal(blur?: boolean, grey?: boolean) {
    if (this.modalRef !== undefined && location.hash.search('modalOpen') === -1) {
        this.modalRef.show(grey);
      if (window['addHash'] === true ) {
         location.hash = location.hash + '?modalOpen';
      }
      window.addEventListener('hashchange', this.urlChange);
    }
    if (blur !== undefined && blur === false) {
      this.blur = false;
    } else {
      this.blur = true;
    }
  }

  /**
   * hides modal instance
   */
  public hideModal() {
    this.onHide.next(this.modalRef);
    this.modalRef.hide();
  }

  /**
   * Set the content component of the modal
   * @param {[type]} component [component class]
   * @param {string} title     [title to display on modal]
   * @param {string} css       [css class to be applied to modal]
   */
  public setModalContent(component, title?: string, css?: string) {
     if (title) {
      this.setTitle(title);
    } else {
      this.setTitle('');
    }
    if (css) {
      this.setCssClass(css);
    } else {
      this.setCssClass('');
    }
    this.setBodyCssClass('');
    // unsubscribe from templateChange event before change the template
    this.unsubscribeTemplateChange();
    this.unsubscribeOpenModal();
    this.unsubscribeCloseModal();
    this.unsubscribeHiddenModal();
    this.modalRef.setModalContent(component);
    this.modalRef.disableKeyboardListener();
  }
  /**
   * Set the modal title
   * @param {string} title [title of the modal]
   */
  public setTitle (title: string) {
    this.modalRef.setTitle(title);
  }
  /**
   * Set modal css class
   * @param {string} style [css class or classes string]
   */
  public setCssClass(style: string) {
    this.modalRef.setCssClass(style);
  }
  /**
   * Set modal css class
   * @param {string} style [css class or classes string]
   */
  public setBodyCssClass(style: string) {
    this.modalRef.setBodyCssClass(style);
  }
  /**
   * Disable keyboard event listener
   */
  public disableKeyboardListener() {
    this.modalRef.disableKeyboardListener();
  }
  /**
   * Enables keyboard event listener
   */
  public enableKeyboardListener() {
    this.modalRef.enableKeyboardListener();
  }

  /**
   * Set if new modal style is shown and the text of the submit button from bottom-bar
   * @param {string} submitText [text to show on submit button]
   * @param {boolean} showNewModal [modal is shown with new style]
   * @param {boolean} showBottomBar [footer bar is shown with new style]
   */
  public setModalFooterBar(submitText: string, showNewModal: boolean, options: any = {}) {
    this.modalRef.setModalFooterBar(submitText, showNewModal, options);
  }

  public hideFooter() {
    this.modalRef.hideFooter();
  }

  public disableHash() {
    window['addHash'] = false;
  }
  public enableHash() {
    window['addHash'] = true;
  }

  /**
   * Reload the modal, this generate the modal view again
   */
  public reload() {
    this.modalRef.reload();
  }
  /**
   * Set a component reference
   * @param {any} ref [description]
   */
  public setParentRef(ref: any) {
    this.parentRef = ref;
  }
  /**
   * Remove the parentRef property
   */
  public removeParentRef() {
    this.parentRef = undefined;
  }
  /**
   * Return the parentRef property
   */
  public getParentRef() {
    return this.parentRef;
  }
}
