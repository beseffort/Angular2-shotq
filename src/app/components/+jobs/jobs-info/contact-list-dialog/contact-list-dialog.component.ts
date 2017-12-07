import * as _ from 'lodash';
import {
  Component, ViewChild, Output, EventEmitter, Input, OnChanges, SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { Action } from '../../../shared/dropdown/dropdown.component';
import { Job, JobApiJobContact } from '../../../../models/job';
import { JobRole } from '../../../../models/job-role';
import {
  ArchiveContactAction, ChangeContactAction, DeleteContactAction,
  SetAsPrimaryContactAction
} from '../../../shared/jobs-ui/jobs-ui.actions';


@Component({
  selector: 'job-contact-list-dialog',
  templateUrl: 'contact-list-dialog.component.html',
  styleUrls: ['contact-list-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobContactListDialogComponent implements OnChanges {
  @Input() job: Job;
  @Input() roles: JobRole[] = [];
  @Output() changeJobContact = new EventEmitter<JobApiJobContact>();
  @Output() addJobContact = new EventEmitter<void>();
  @Output() jobContactChanged = new EventEmitter<JobApiJobContact>();
  @Output() archiveJobContacts = new EventEmitter<JobApiJobContact[]>();
  @Output() deleteJobContacts = new EventEmitter<JobApiJobContact[]>();
  @Output() setAsPrimaryJobContact = new EventEmitter<JobApiJobContact>();
  @ViewChild(ModalDirective) private modal: ModalDirective;
  //noinspection JSMismatchedCollectionQueryUpdate
  private contacts: JobApiJobContact[] = [];
  private numberOfContacts: number = 0;
  private contactChangeBuffer = JobApiJobContact.Empty;

  show() {
    this.modal.show();
  }

  hide() {
    this.modal.hide();
  }

  get isVisible() {
    return this.modal.isShown;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.job && changes.job.currentValue) {
      this.resetContactsFromJob(changes.job.currentValue as Job);
    }
  }

  private resetContactsFromJob(job: Job): void {
    this.stopChanges();
    this.numberOfContacts = job.job_contacts.length;
    this.contacts = _(job.job_contacts)
      .map(item => {
        // Removing empty items after initialization is a bit stinky approach,
        // but it allows us to build the action list in a single step.
        // That would be great if this could be done on the `DropdownComponent`
        // side.
        let actions: Action[] = _.compact([
          // The semantics of ChangeContactAction has changed.
          // Now it literally means 'Change the contact in the directory', not
          // 'Change the job contact role'.
          !item.archived ? ChangeContactAction : null,
          !(item.archived || job.isPrimaryJobContact(item)) ?
              SetAsPrimaryContactAction : null,
          !job.isPrimaryJobContact(item) ? DeleteContactAction : null
        ]);
        return Object.assign(new JobApiJobContact(), item, {$actions: actions});
      }).value();
  }

  //noinspection JSUnusedLocalSymbols
  private startChanges(contact: JobApiJobContact) {
    this.stopChanges();
    this.contactChangeBuffer = _.cloneDeep(contact);
    // keep reference to the original object, so we can update it on commit
    this.contactChangeBuffer['$contactToBeChanged'] = contact;
  }

  //noinspection JSUnusedLocalSymbols
  private commitChanges() {
    if (this.contactChangeBuffer === JobApiJobContact.Empty)
      return;
    let original = this.contactChangeBuffer['$contactToBeChanged'];
    let hasChanged = this.contactChangeBuffer.primaryRole.id !== original.primaryRole.id;
    if (hasChanged) {
      let newValue = cleanCopy(this.contactChangeBuffer);
      Object.assign(original, newValue);  // save the changes to the local copy
      this.jobContactChanged.emit(newValue);
    }
    this.stopChanges();

    function cleanCopy(o: any): any {
      // strip all the helper properties (those starting with the $ sign)
      return _.omitBy(o || {}, (value, key) => {
        return key[0] === '$';
      });
    }
  }

  private stopChanges() {
    this.contactChangeBuffer = JobApiJobContact.Empty;
  }

  // <editor-fold desc="Event handlers">

  //noinspection JSUnusedLocalSymbols
  private onContactRoleIdChanged(id: number) {
    if (this.contactChangeBuffer === JobApiJobContact.Empty)
      return;
    this.contactChangeBuffer.primaryRole = _.find(this.roles, ['id', id]);
  }

  //noinspection JSUnusedLocalSymbols
  private onAddJobContact(event) {
    this.addJobContact.emit();
  }

  //noinspection JSUnusedLocalSymbols
  private onContactActionClicked(contact: JobApiJobContact, action: Action) {
    switch (action.id) {
      case ChangeContactAction.id:
        this.changeJobContact.emit(contact);
        break;
      case ArchiveContactAction.id:
        this.archiveJobContacts.emit([contact]);
        break;
      case DeleteContactAction.id:
        this.deleteJobContacts.emit([contact]);
        break;
      case SetAsPrimaryContactAction.id:
        this.setAsPrimaryJobContact.emit(contact);
        break;
      default:
        console.warn('Unexpected contact action', action);
        break;
    }
  }
  // </editor-fold>
}
