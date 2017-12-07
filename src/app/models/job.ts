import { Contact } from './contact';
import { EventGroup } from './event-group';
import { JobRole } from './job-role';
import { JobType } from './job-type';
import { Role } from './role';
import { JobRoleService } from '../services/job-role/job-role.service';

// see job_api_v1.ContactMinimalSerializer (person.models.Contact)
export class JobApiBaseContact {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  default_email_address: string;
  default_email_type: string;
  default_phone_number: string;
  default_phone_type: string;
  default_address_address1: string;

}

// see job_api_v1.ExternalOwnerSerializer (person.models.Contact)
export class JobApiExternalOwner extends JobApiBaseContact {
  job_contacts: any[];  // see job_api_v1.JobContactSerializer (job.models.JobContact)
}

// see job_api_v1.WorkerMinimalSerializer (person.models.Worker)
export interface JobApiInternalOwner {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    active: boolean;
    name: string;
    avatar?: any;
}

// see job_api_v1.JobWorkerMinimalSerializer (job.models.JobWorker)
export interface JobApiJobWorker {
  id: number;
  worker: number;
  name: string;
  roles: any[];
  active: boolean;
  email: string;
  avatar?: any;
}

/**
 * This class represents an item of the `job_contacts` collection
 * in the `Job` class.
 * See job_api_v1.JobContactMinimalSerializer (job.models.JobContact)
 */
export class JobApiJobContact {
  public static readonly Empty = new JobApiJobContact();
  id: number;
  created: string;
  name: string;
  roles: JobRole[];
  default_email_id: any;
  default_email_address: string;
  default_phone_id: any;
  default_phone_number: string;
  contact: number;
  active: boolean;
  archived: boolean;

  get primaryRole(): JobRole {
    if (this.roles && this.roles.length > 0)
      return JobRoleService.newObject(this.roles[0]);
    return JobRole.Empty;
  }

  set primaryRole(value: JobRole) {
    if (this.roles !== undefined && !this.roles.length)
      this.roles.push(value);
    else
      this.roles[0] = value;
  }
}


/**
 * Job post definition in ShootQ API: http://api.shootq.io:8000/apidocs/#!/job/post_api_v1_job_job
 */
export class Job {
  id: number;
  billing_order: string;
  booking_date: string;
  brand: string;
  created: string;
  eventgroups: Array<EventGroup>;
  external_owner: JobApiExternalOwner;
  internal_owner: JobApiInternalOwner;
  job_contacts: JobApiJobContact[] = [];
  job_type: number;
  job_type_details?: JobType;
  job_workers: JobApiJobWorker[];
  main_event: any;
  main_event_date: string;
  main_event_group?: {
    id?: number;
    address: string;
    start: string;
    end: string;
  };
  external_owner__first_name: string;
  external_owner__last_name: string;
  main_event_details: any;
  modified: string;
  name: string;
  next_event_date: string;
  over: boolean; // custom variable for job header
  referrers: Array<any>;
  status: string;
  account_logo?: string;

  // these fields stays to do not break jobs add section
  contacts: Contact[];
  roles: Role[];
  events: Array<any>;
  client_site_links?: Array<any>;
  proposals?: number[];

  isPrimaryContactId(id: number): boolean {
      if (id && this.external_owner && this.external_owner.id)
        return id === this.external_owner.id;
      return false;
  }

  isPrimaryJobContact(contact: JobApiJobContact): boolean {
    return this.isPrimaryContactId(contact.contact);
  }

  get primaryContact(): JobApiJobContact {
    let result = this.job_contacts.find(this.isPrimaryJobContact.bind(this));
    if (result)
      return Object.assign(new JobApiJobContact(), result);
    return JobApiJobContact.Empty;
  }
}

export const archivedJobStatus = 'archived';
export const deletedJobStatus = 'deleted';
export const activeJobStatus = 'opportunity';
