import { Injectable } from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { JobPerson } from '../../models/job-person';

@Injectable()
export class JobPersonService extends RestClientService<JobPerson> {
  baseUrl = 'job/jobperson';

  addJobPersonRelation(data) {
    return this.create(data);
  }
}
