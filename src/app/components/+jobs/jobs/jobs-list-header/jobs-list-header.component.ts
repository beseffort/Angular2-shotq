import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  OnChanges,
  AfterViewChecked,
  DoCheck }                         from '@angular/core';
import { Router, ActivatedRoute }   from '@angular/router';
/* Services */
import { ModalService }             from '../../../../services/modal/';
import { JobService }               from '../../../../services/job/';
import { EventService }             from '../../../../services/event/';
import { JobTypeService }           from '../../../../services/job-type/';
import { FlashMessageService }      from '../../../../services/flash-message';
import { GeneralFunctionsService }  from '../../../../services/general-functions';

declare let require: (any);

@Component({
    selector: 'jobs-list-header',
    templateUrl: './jobs-list-header.component.html',
    styleUrls: ['./jobs-list-header.component.scss'],
    providers: [JobService, JobTypeService, GeneralFunctionsService, EventService]
})
export class JobsListHeaderComponent {
  constructor () {
  }

  ngOnInit() {
  }

  ngDoCheck() {
  }
}
