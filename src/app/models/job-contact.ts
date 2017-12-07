// job_api_v1.serializers.JobContactSerializer
export class JobContact {
  id?: number;
  created: string;
  modified: string;
  active: boolean;
  archived: boolean;
  job: number;
  contact: number;
  roles: number[];
}
