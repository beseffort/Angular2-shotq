import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
/* Services */
import { ModalService } from '../../../services/modal/';
import { SuccessfulModalModule } from '../successful-modal';
declare let require: (any);

@Component({
    selector: 'open-modal-by-url',
    templateUrl: './open-modal-by-url.component.html'
})
export class OpenModalByUrlComponent {
    private sub: any;
    private modalInstance = undefined;

    constructor(
      private modalService: ModalService,
      private router: Router, // Router object, with this we can call navigate function.
      private activatedRoute: ActivatedRoute, // Routes url params extractor.
    ) {}

    ngOnInit() {
      window['openModalByUrlComponentRef'] = this;
      window.addEventListener('hashchange', this.urlChange);
      this.startModal();
    }

    ngOnDestroy() {
      window.removeEventListener('openModalByUrlComponentRef', this.urlChange);
      window['componentRef'] = undefined;
      this.modalService.enableHash();
    }

    private startModal() {
      let title = '';
      let cssStyles = '';
      let submitText = 'SAVE';
      let redirectTo = 'dashboard';
      let id = undefined;
      let id1 = undefined;
      let id2 = undefined;
      let referer = undefined;

      let entity = undefined;
      let action = undefined;
      let moduleName = undefined;

      let splitted_url = this.router.url.split('/');

      // check if url has an id parameter
      this.sub = this.activatedRoute.params.subscribe(params => {
        if (params.hasOwnProperty('id') && params['id'].length) {
          id = +params['id'];
        }
        if (params.hasOwnProperty('id1') && params['id1'].length) {
          id1 = +params['id1'];
        }
        if (params.hasOwnProperty('id2') && params['id2'].length) {
          id2 = +params['id2'];
        }
      });
      // entity -> 'contacts' for example
      // action -> 'add' or 'edit'
      // splitted_url[0] is always ''
      if (splitted_url && splitted_url.length >= 2) {
        entity = splitted_url[1];
      }

      let modulePath: string = '';
      let mod = undefined;
      let showModalFooter = true;
      if (splitted_url && splitted_url.length >= 3) {
        switch (entity) {
          case 'contacts':
            action = splitted_url[2];
            // Title for /contacts/add -> New Contact
            // Title for /contacts/edit/2 -> Edit Contact
            if (action === 'add') {
              title = 'New ' + entity[0].toUpperCase() + entity.slice(1, -1);
              cssStyles = 'contactsAddEditModal';
            } else {
              title = action[0].toUpperCase() + action.slice(1) + ' ' + entity[0].toUpperCase() + entity.slice(1, -1);
              if (action === 'edit') {
                cssStyles = 'contactsAddEditModal';
              }
            }
            // Module name -> ContactsAddModule
            moduleName = entity[0].toUpperCase() + entity.slice(1) + action[0].toUpperCase() + action.slice(1) + 'Module';
            // Load module
            mod = require('../../+' + entity + '/' + entity + '-' + action + '/' + entity + '-' + action + '.module');
            if (action === 'merge') {
              showModalFooter = false;
            }
            // redirects to the entity section when modal is closed (contacts list for example)
            if (referer === undefined) {
              redirectTo = entity;
            }
            break;
          case 'pricing':
            if (splitted_url && splitted_url.length >= 3) {
              action = splitted_url[3];
              if (action === 'add' || action === 'edit') {
                action = 'edit';
                let subEntity = splitted_url[2];
                // remove 's' from subEntity
                if (subEntity[subEntity.length - 1] === 's') {
                  subEntity = subEntity.substring(0, subEntity.length - 1);
                }
                moduleName = subEntity[0].toUpperCase() + subEntity.slice(1) + action[0].toUpperCase() + action.slice(1) + 'Module';
                // Load module
                mod = require('../../+' + entity + '/' + subEntity + '/' + subEntity + '-' + action + '/' + subEntity + '-' + action + '.module');
                if (action === 'edit') {
                  cssStyles = 'modal-sm pricingItemEditModal';
                }
                showModalFooter = false;
                // redirects to the entity section when modal is closed (contacts list for example)
                if (referer === undefined) {
                  redirectTo = entity + '/' + subEntity + 's';
                }
              }
            }
            break;
          default:
            mod = undefined;
            break;
        }
      }

      if (mod !== undefined) {
        this.modalService.setModalContent(mod[moduleName], title, cssStyles);
        this.modalService.reload();
        if (showModalFooter) {
          this.modalService.setModalFooterBar(submitText.toUpperCase(), true, true);
        }
        this.modalService.disableHash();
        this.modalService.showModal();
        let subscriber = this.modalService.templateChange.subscribe(data => {
          this.modalInstance = data.instance;
          if (id) {
            this.modalInstance.id = id;
          }
          if (id1) {
            this.modalInstance.id1 = id1;
          }
          if (id2) {
            this.modalInstance.id2 = id2;
          }
          this.modalInstance.redirectTo = redirectTo;
          this.modalInstance.setComponentRef(this);
        });
        this.modalService.subscribeTemplateChange(subscriber);
        let closeModalSubs = this.modalService.closeModal.subscribe(res => {
          if (action !== 'merge') {
            this.router.navigate([redirectTo]);
          }
        });
        this.modalService.subscribeCloseModal(closeModalSubs);
        let hiddenModalSubs = this.modalService.hiddenModal.subscribe(res => {
          let e = document.querySelector('body.openOldModal');
          if (e && e !== undefined) {
            e.classList.remove('openOldModal');
          }
          if (action === 'merge') {
            this.showSuccessModal();
          }
        });
        this.modalService.subscribeHiddenModal(hiddenModalSubs);
      }
    }
    /**
     * Handle url change
     * @param {[type]} ref [description]
     */
    private urlChange(ref) {
      let aux = ref.newURL.search('/profile/');
      if (!( aux !== -1)) {
        window['openModalByUrlComponentRef'].startModal();
      }
    }
    /**
     * Show successful modal or remove the modalContactMerge if 'Cancel' was pressed
     */
    private showSuccessModal() {
      let modalData = this.modalService.data;
      this.modalService.data = undefined;
      if (modalData !== undefined && modalData.success !== undefined && modalData.success) {
        this.modalService.setModalContent(SuccessfulModalModule);
        this.modalService.showModal();
        let subscriber = this.modalService.templateChange.subscribe(data => {
            this.modalInstance = data.instance;
            this.modalInstance.setComponentRef(this);
            this.modalInstance.closeWithTimeout();
        });
        this.modalService.subscribeTemplateChange(subscriber);
        let hiddenSuccessful = this.modalService.hiddenModal.subscribe(res => {
          let eMerge = document.querySelector('body.modalContactMerge');
          if (eMerge && eMerge !== undefined) {
            eMerge.classList.remove('modalContactMerge');
          }
        });
        this.modalService.subscribeHiddenModal(hiddenSuccessful);
      } else {
        // not success, then remove the modalContactMerge class
        let eMerge = document.querySelector('body.modalContactMerge');
        if (eMerge && eMerge !== undefined) {
          eMerge.classList.remove('modalContactMerge');
        }
      }
    }
}
