import { EventType } from '../../../models/event-type';
import { JobWorker } from '../../../models/job-worker';

export interface CalendarFilterOptions {
  eventTypes: EventType[];
  jobWorkers: JobWorker[];
  unassigned: boolean;
  booked: boolean;
  lead: boolean;
}
