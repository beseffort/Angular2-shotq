import moment from 'moment';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'utcdate'
})
export class UTCDatePipe implements PipeTransform {
  transform(value: any, format: string): string {
    if (value) {
      let dt = moment.utc(value);
      if (dt.isValid()) {
        return dt.format(format);
      }
    }
    return '';
  }
}
