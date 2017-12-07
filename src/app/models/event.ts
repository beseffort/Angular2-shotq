import { BaseLocation } from './address';

export interface BaseEvent {
  id?: number;
  to_be_determined: boolean;
  all_day?: boolean;
  event_group: number;
  account: number;
  start?: any;
  end?: any;
}

export class Event implements BaseEvent {
  public static Empty = Object.assign(new Event(), {id: -1});
  id?: number = 0;
  account: number;
  all_day?: boolean;
  brand?: number;
  confirmed?: boolean;
  contacts?: Array<any>;
  created?: string;
  email_template?: number;
  end?: string;
  event_data?: Array<any>;
  event_group: number;
  event_type?: number;
  event_type_details?: Object;
  has_conflict?: boolean;
  location?: BaseLocation;
  main_contact?: number;
  modified?: string;
  name: string;
  notify_on_change?: boolean;
  slug?: string;
  start?: string;
  workers?: Array<any>;
  to_be_determined: boolean;
}
