import * as _ from 'lodash';
import {
  Component, EventEmitter, Input, OnChanges, Output, SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';
import { Job, JobApiJobContact } from '../../../../models/job';

const DEFAULT_TOP_CONTACTS_COUNT = 5;

@Component({
  selector: 'job-top-contact-list',
  templateUrl: 'jobs-info-top-contact-list.component.html',
  styleUrls: ['jobs-info-top-contact-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobTopContactListComponent implements OnChanges {
  @Input() job: Job;
  /** maximum number of contacts to display */
  @Input() maxContactCount: number = DEFAULT_TOP_CONTACTS_COUNT;
  @Output() onAddContact = new EventEmitter<void>();
  @Output() onDisplayAllContacts = new EventEmitter<void>();
  //noinspection JSMismatchedCollectionQueryUpdate
  private contacts: JobApiJobContact[] = [];
  private numberOfContacts: number = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes.job) {
      this.resetContactsFromJob(changes.job.currentValue as Job);
    }
  }

  getProposalId() {
    let proposal = _.last(this.job.proposals);
    return proposal['id'];
  }

  private resetContactsFromJob(job: Job) {
    if (_.isNil(job))
      return;
    this.numberOfContacts = job.job_contacts.length;
    this.contacts = _(job.job_contacts)
      .take(this.maxContactCount)
      .map(item => {
        let clientLink = job.client_site_links.find(l => l.signature.contact === item.contact);
        let accessToken = !(clientLink && clientLink.link) ? null :
            clientLink.link.match(/access_token=(.+)/)[1];
        return Object.assign(new JobApiJobContact(), item, {
          $accessToken: accessToken
        });
      })
      .value();
  }

  //noinspection JSUnusedLocalSymbols
  private onAddContactClicked() {
    this.onAddContact.emit();
  }

  //noinspection JSUnusedLocalSymbols
  private onDisplayAllContactsClicked() {
    this.onDisplayAllContacts.emit();
  }
}
