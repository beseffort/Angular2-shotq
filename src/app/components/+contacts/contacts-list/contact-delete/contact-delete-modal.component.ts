import { Component, ViewContainerRef } from '@angular/core';

import * as _ from 'lodash';

import { BSModalContext, Modal } from 'single-angular-modal/plugins/bootstrap';
import { DialogRef, ModalComponent, Overlay } from 'single-angular-modal';

import { Contact } from '../../../../models/contact';



export class ContactDeleteWindowData extends BSModalContext {
  public contacts: Array<Contact>;
}


@Component({
  templateUrl: './contact-delete-modal.component.html',
  styleUrls: ['./contact-delete-modal.component.scss']
})
export class ContactDeleteModalComponent implements ModalComponent<ContactDeleteWindowData>  {
  contacts: Array<Contact> = [];
  contactsWithRelations: Array<Contact> = [];

  constructor(public modal: Modal,
              public vcRef: ViewContainerRef,
              public overlay: Overlay,
              public dialog: DialogRef<ContactDeleteWindowData>) {
    dialog.context.isBlocking = true;
  }

  ngOnInit() {
    this.contacts = this.dialog.context.contacts;
    this.contactsWithRelations = _.filter(this.contacts, {has_relations: true});
  }

  close() {
    this.dialog.close();
  }

  dismiss() {
    this.dialog.dismiss();
  }

}
