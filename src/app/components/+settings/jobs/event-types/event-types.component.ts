import * as _ from 'lodash';
import { Component, ViewContainerRef } from '@angular/core';
import { Modal } from 'single-angular-modal/plugins/bootstrap';
import { Overlay } from 'single-angular-modal';

import { EventType } from '../../../../models/event-type';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import { EventTypeService } from '../../../../services/event-type';
import { BreadcrumbService } from '../../../shared/breadcrumb/components/breadcrumb.service';
import { BaseTypesEditorComponent } from '../../base-types-editor';
import { SortPipe } from '../../../../pipes/sort/sort.pipe';


@Component({
  templateUrl: '../../base-types-editor/base-types-editor.component.html',
  styleUrls: ['../jobs.component.scss'],
  providers: [ EventTypeService, SortPipe ]
})
export class EventTypesComponent extends BaseTypesEditorComponent<EventType> {
  constructor(
    modal: Modal,
    sortPipe: SortPipe,
    overlay: Overlay,
    vcRef: ViewContainerRef,
    flash: FlashMessageService,
    service: EventTypeService,
    breadcrumbService: BreadcrumbService
  ) {
    super('event type', modal, sortPipe, overlay, vcRef, flash, service, breadcrumbService);
  }
}
