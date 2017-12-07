import { Injectable } from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { JobNote } from '../../models/job-note';


@Injectable()
export class JobNoteService extends RestClientService<JobNote> {
  baseUrl = 'job/jobnote';

  getList(params: any) {
    return super.getList(params)
      .map(response => {
        return {jobNotes: response.results, total: response.count};
      });
  }

  getListByJob(id: number, params: object = {}) {
    return this.apiService.get(`/job/job/${id}/notes/`, null, RestClientService._getSearchParams(params))
      .map(response => {
        return {jobNotes: response.results, total: response.count};
      });
  }

  update(id: number, data: Object = {}) {
    return this.partialUpdate(id, data);
  }
}
