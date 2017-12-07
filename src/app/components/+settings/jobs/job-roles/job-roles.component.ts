import { Component, ViewContainerRef } from '@angular/core';

import { Modal } from 'single-angular-modal/plugins/bootstrap';
import { Overlay } from 'single-angular-modal';

import { BreadcrumbService } from '../../../shared/breadcrumb/components/breadcrumb.service';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import { JobRoleService } from '../../../../services/job-role/job-role.service';
import { JobRole } from '../../../../models/job-role';
import { SortPipe } from '../../../../pipes/sort/sort.pipe';
import { BaseTypesEditorComponent } from '../../base-types-editor/base-types-editor.component';


@Component({
  templateUrl: '../../base-types-editor/base-types-editor.component.html',
  styleUrls: ['../jobs.component.scss'],
  providers: [ JobRoleService, SortPipe ]
})
export class JobRolesComponent extends BaseTypesEditorComponent<JobRole> {
  public hasColorPicker = false;

  constructor(
    modal: Modal,
    sortPipe: SortPipe,
    overlay: Overlay,
    vcRef: ViewContainerRef,
    flash: FlashMessageService,
    service: JobRoleService,
    breadcrumbService: BreadcrumbService
  ) {
    super('job role', modal, sortPipe, overlay, vcRef, flash, service, breadcrumbService);
  }
}
