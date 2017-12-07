export class Person {
  id: number;
  emails: Array<Object>; // required
  phones: Array<Object>; // required
  addresses: Array<Object>; // required
  modified: Date;
  created: Date;
  person_type: string;
  first_name: string; // required
  last_name: string; // required
  maiden_name: string;
  company_name: string;
  active: boolean;
  archived: string;
  user: string;
  account: string; // required
  default_email: string;
  default_phone: string;
  default_address: string;
  brands: string; // required
  brand_roles: string; // required
  social_networks: Array<Object>;
  /* Additional fields */
  birthday: Date;
  anniversary: Date;
  treat_as_company: boolean;
  city: string;
  state: string;
  zip: number;
  country: string;
  img: string;
}
