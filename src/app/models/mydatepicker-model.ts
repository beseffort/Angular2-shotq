import * as _ from 'lodash';
import moment from 'moment';
import { IMyDateModel } from 'ngx-mydatepicker';

export interface MyDatepickerDate {
  date: {
    year: number;
    month: number;
    day: number;
  };
}

export class DatePickerValue implements IMyDateModel {
  jsdate: Date;
  formatted: string;
  epoc: number;
  date: { year: number; month: number; day: number };

  static fromDate(value: Date): DatePickerValue {
    let result = {
      date: {
        year: value.getFullYear(),
        month: value.getMonth() + 1,
        day: value.getDate()
      }
    };
    return Object.assign(new DatePickerValue(), result);
  }

  static fromDateString(value: string): DatePickerValue {
    let timestamp = Date.parse(value);
    if (_.isNaN(timestamp))
      return;
    return DatePickerValue.fromDate(new Date(timestamp));
  }

  static toDate(value: IMyDateModel): Date {
    if (!value)
      return;
    if (value.jsdate instanceof Date)
      return value.jsdate;
    if (value.date)
      return new Date(value.date.year, value.date.month - 1, value.date.day);
  }

  static toDateString(value: IMyDateModel): string {
    if (!value)
      return;
    return moment(value.jsdate).format('YYYY-MM-DD');
  }
}
