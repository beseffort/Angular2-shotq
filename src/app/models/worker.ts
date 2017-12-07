export class Worker {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  custom_job_role: string;
  avatar: string;
  created: Date;
  modified: Date;
  role: string;
  job_role: string;
  use_default_role_for_all_brands: boolean;
  active: boolean;
  hide_billing_details: boolean;
  disable_client_correspondence: boolean;
  account: number;
  user_profile: number;
  default_account: number;
  selected_account: number;
  default_brand: number;
  selected_brand: number;
  brands: Array<number>;

  over: boolean; // custom field for job header
  formattedRoles: string; // custom field for job header
}
