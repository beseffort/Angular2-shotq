import * as _ from 'lodash';
import { Component, ViewContainerRef } from '@angular/core';
import { Modal } from 'single-angular-modal/plugins/bootstrap';
import { Overlay } from 'single-angular-modal';

import { JobType } from '../../../../models/job-type';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import { JobTypeService } from '../../../../services/job-type/job-type.service';
import { BreadcrumbService } from '../../../shared/breadcrumb/components/breadcrumb.service';
import { BaseTypesEditorComponent } from '../../base-types-editor';
import { SortPipe } from '../../../../pipes/sort/sort.pipe';


@Component({
  templateUrl: '../../base-types-editor/base-types-editor.component.html',
  styleUrls: ['../jobs.component.scss'],
  providers: [ JobTypeService, SortPipe ]
})
export class JobTypesComponent extends BaseTypesEditorComponent<JobType> {
  constructor(
    modal: Modal,
    sortPipe: SortPipe,
    overlay: Overlay,
    vcRef: ViewContainerRef,
    flash: FlashMessageService,
    service: JobTypeService,
    breadcrumbService: BreadcrumbService
  ) {
    super('job type', modal, sortPipe, overlay, vcRef, flash, service, breadcrumbService);
  }
}
