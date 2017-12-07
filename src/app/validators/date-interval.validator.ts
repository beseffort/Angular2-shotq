import moment from 'moment';
import { FormGroup, ValidatorFn } from '@angular/forms';

export function datesIntervalValidator(startFieldName: string, endFieldName: string): ValidatorFn {
  return (group: FormGroup): {[key: string]: any} => {
    let startCtrl = group.controls[startFieldName];
    let endCtrl = group.controls[endFieldName];

    if (startCtrl.value && endCtrl.value) {
      let startDt = moment(startCtrl.value);
      let endDt = moment(endCtrl.value);
      if (startDt.diff(endDt) > 0) {
        return {
          invalidInterval: true
        };
      } else {
        return null;
      }
    }
  };
}
