import { Injectable } from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { JobContact } from '../../models/job-contact';

@Injectable()
export class JobContactService extends RestClientService<JobContact> {
  baseUrl = 'job/jobcontact';

  public static newObject(data?: object): JobContact {
    return Object.assign(new JobContact(), data || {});
  }
}
