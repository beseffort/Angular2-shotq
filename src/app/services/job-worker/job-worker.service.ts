import { Injectable } from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { JobWorker } from '../../models/job-worker';

@Injectable()
export class JobWorkerService extends RestClientService<JobWorker> {
  baseUrl = 'job/jobworker';
}
