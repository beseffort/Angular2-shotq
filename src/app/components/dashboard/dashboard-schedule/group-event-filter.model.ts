import moment from 'moment';
import * as _ from 'lodash';
import { isBoolean } from 'util';

export interface EventGroupFilterParams {
  from_date?: moment.Moment;
  to_date?: moment.Moment;
  event_type?: string;
  job_workers?: string;
  unassigned?: boolean;
  booked?: boolean;
  lead?: boolean;
}

export class EventGroupFilter {
  params: EventGroupFilterParams;
  periodStr: string;
  private periodFormat: string = 'MMM DD';

  constructor(params?) {
    this.params = params || {};
  }

  updateFilterParams(updates: EventGroupFilterParams) {
    _.assign(this.params, updates);
    this.updatePeriodStr();
  }

  toQueryParams() {
    let result = {};

    if (this.params.from_date && this.params.to_date)
      result['period_0'] = this.params.from_date.toISOString();
      result['period_1'] = this.params.to_date.toISOString();

    if (this.params.event_type)
      result['event_type'] = this.params.event_type;

    if (this.params.job_workers)
      result['job_workers'] = this.params.job_workers;

    let booleanFields = ['unassigned', 'booked', 'lead'];
    for (let bField of booleanFields) {
      if (isBoolean(this.params[bField])) {
        result[bField] = this.params[bField] ? 'True' : 'False';
      }
    }
    return result;
  }

  private updatePeriodStr() {
    let fromDt = this.params.from_date.format(this.periodFormat);
    let toDt = this.params.to_date.format(this.periodFormat);
    this.periodStr = `${fromDt} - ${toDt}`;
  }

}
