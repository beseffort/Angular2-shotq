import { BaseAddress } from '../../../../../models/address';

export interface EventGroupFormModel {
  name: string;
  created?: string;
  updated?: string;
  location?: BaseAddress;
  start: string;
  end: string;
  location_name: string;
  address?: string;
  description?: string;
  all_day?: boolean;
  event_type?: number;
}
