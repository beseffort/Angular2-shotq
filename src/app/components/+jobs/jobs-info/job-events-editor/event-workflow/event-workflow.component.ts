import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EventGroup } from '../../../../../models/event-group';

@Component({
  selector: 'event-workflow',
  templateUrl: './event-workflow.component.html',
  styleUrls: ['./event-workflow.component.scss']
})
export class EventWorkflowComponent {
  @Input() eventGroups: EventGroup[] = [];
  @Input() mainEvent: EventGroup;
  @Input() selected: EventGroup;
  @Output() onAddGroup: EventEmitter<number> = new EventEmitter<number>();
  @Output() onEditGroup: EventEmitter<EventGroup> = new EventEmitter<EventGroup>();

  addNewGroup(index: number) {
    this.onAddGroup.emit(index);
  }

  editGroup(group: EventGroup) {
    this.onEditGroup.emit(group);
  }

}
