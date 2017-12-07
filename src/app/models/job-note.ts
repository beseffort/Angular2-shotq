import { BaseNote } from './notes';

/**
 * This class represents `JobNote` resource.
 * See job_api_v1.JobNoteSerializer(job.models.JobNote)
 */
export class JobNote extends BaseNote {
  job: number; // Required

  constructor(id: number, subject: string, body: string, job: number) {
    super(id, subject, body);
    this.job = job;
  }
}
