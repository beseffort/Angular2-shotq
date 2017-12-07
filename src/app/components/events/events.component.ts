import { Component, OnInit } from '@angular/core';
/* Components */
import { ChooseContactModule } from '../shared/choose-contact';
import { ModalService } from '../../services/modal/';

@Component({
  selector: 'app-events',
  templateUrl: 'events.component.html',
  styleUrls: ['events.component.scss'],
})
export class EventsComponent implements OnInit {

  constructor(private modalService: ModalService) { }

  ngOnInit() {
  }

  private modalOpen() {
    let title = 'Contacts';
    let style = 'addContactBlock';
    this.modalService.setModalContent(ChooseContactModule, title, style);
    this.modalService.showModal();
    let subscriber = this.modalService.templateChange.subscribe(data => data.instance.setComponentRef(this));
    this.modalService.subscribeTemplateChange(subscriber);
  }
}
