import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestClientService } from '../rest-client/rest-client.service';
import { Job } from '../../models/job';

@Injectable()
export class JobService extends RestClientService<Job> {
  baseUrl = 'job/job';

  public static newObject(data?: object): Job {
    return Object.assign(new Job(), data || {});
  }

  getList(params: Object = {page: 1, per_page: 10}) {
    return super.getList(params).map(response => {
      return {jobs: response.results, total: response.count};
    });
  }

  bulkUpdate(data: Array<{ id: Number }>) {
    return this.apiService.patch(`${this._getListUrl()}`, data);
  }

  getOrCreateProposal(id: number) {
    return this.itemPost(id, 'get_or_create_proposal');
  }

  getCurrentContactInfo(id: number) {
    return this.itemGet(id, 'current_contact');
  }

  getWorkerConflicts(id: number) {
    return this.itemGet(id, 'worker_conflicts');
  }

  getCorrespondence(id: number) {
    return this.itemGet(id, 'get_correspondence');
  }

  getInvoices(jobId: number) {
    return this.itemGet(jobId, 'invoices');
  }

  getNewLeadsStat() {
    return this.listGet('new_lead');
  }

  /**
   * Sets the given contact as the primary contact for the job.
   * @param jobId the ID of the job to be updated
   * @param contactId - ID of `Contact` instance to be used as the job primary contact.
   * @return {Observable<Job>}
   */
  resetJobPrimaryContactId(jobId: number, contactId: number) {
    return Observable.concat(
      this.partialUpdate(jobId, {external_owner: contactId}),
      this.get(jobId)
    ).last();
  }
}
