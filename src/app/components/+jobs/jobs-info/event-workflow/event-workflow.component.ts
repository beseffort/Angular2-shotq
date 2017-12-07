import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Job } from '../../../../models/job';

@Component({
  selector: 'event-workflow',
  templateUrl: './event-workflow.component.html',
  styleUrls: ['./event-workflow.component.scss']
})
export class EventWorkflowComponent implements OnInit {
  @Input() job: Job;

  ngOnInit() { }

}
