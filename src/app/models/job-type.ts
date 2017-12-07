export class JobType {
  id?: number;
  name: string;
  display_name?: string;
  created?: string;
  modified?: string;
  color?: string;
  account: number;
  brand?: number;
  active: boolean = true;
  job_template?: number;
}
