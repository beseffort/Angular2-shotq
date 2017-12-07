import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { AlertifyService } from '../../../services/alertify/alertify.service';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import { DialogRef, overlayConfigFactory } from 'single-angular-modal/esm';
import { Modal } from 'single-angular-modal/plugins/bootstrap';
import { Job, JobApiJobContact } from '../../../models/job';
import {
  JobContactDialogComponent, JobContactDialogContext
} from './job-contact-dialog.component';

@Injectable()
export class JobsUiService {
  private jobContactDialog: DialogRef<any>;

  constructor(private alertify: AlertifyService,
              private flash: FlashMessageService,
              private modal: Modal) {
  }

  public displaySuccessMessage(message: string): void {
    this.flash.success(message);
  }

  public displayErrorMessage(message: string): void {
    this.flash.error(message);
  }

  public displayYesNoMessage(message: string): Observable<boolean> {
    let result = new Subject<boolean>();
    this.alertify.confirm(message,
      () => {
        result.next(true);
      },
      () => {
        result.next(false);
      });
    return result;
  }

  public displayAddOrUpdateJobContactDialog(content?: JobApiJobContact): Observable<JobApiJobContact> {
    let result = new Subject<JobApiJobContact>();
    if (this.jobContactDialog && !this.jobContactDialog.destroyed) {
      this.jobContactDialog.destroy();
      this.jobContactDialog = null;
    }
    let config = overlayConfigFactory({content: content}, JobContactDialogContext);
    this.modal.open(JobContactDialogComponent, config)
      .then(dialog => {
        this.jobContactDialog = dialog;
        dialog.result.then(data => {
          result.next(data);
          result.complete();
        }, () => { result.complete(); });
      }, () => { result.complete(); });
    return result;
  }

  /**
   * Returns a new array of the job contacts sorted by when they were added
   * to the job. The primary contact if any, always goes first.
   * @param job The job, containing the original array of contacts.
   * @return {number[]} The sorted array of the job contacts.
   */
  public sortedJobContacts(job: Job): JobApiJobContact[] {
    let contacts = _(job.job_contacts)
      .filter(item => !job.isPrimaryJobContact(item))
      .sortBy(['created'])
      .value();
    let primaryContact = job.primaryContact;
    if (primaryContact)
      contacts.unshift(primaryContact);
    return contacts;
  }
}
