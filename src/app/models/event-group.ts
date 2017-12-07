import moment from 'moment';
import { FormGroup } from '@angular/forms';
import { Event } from './event';
import { BaseLocation } from './address';

export class EventGroup {
  account: number;
  brand: number;
  contact: number;
  created: string;
  events: Array<Event>;
  id: number;
  job: number;
  modified: string;
  name: string;
  location_name: string;
  address?: string;
  start: string;
  end: string;
  all_day?: boolean;
  location?: BaseLocation;
  event_type?: number;
  event_type_color?: string;
  event_type_name?: string;
  event_type_data?: any;

  static setInitialStartTime(group: FormGroup) {
    group.controls['start'].valueChanges
      .first()
      .subscribe(changes => {
        let startValue = changes.clone().set({
          hour: 12,
          minute: 0,
          second: 0,
          millisecond: 0
        });
        group.patchValue({start: startValue});
      });
  }

  static setInitialEndTime(group: FormGroup) {
    let formValue = group.value;
    if (formValue && formValue['start'] && !formValue['end']) {
      group.patchValue({
        end: moment(formValue['start']).clone().add(30, 'minutes')
      });
    }
  }
}
