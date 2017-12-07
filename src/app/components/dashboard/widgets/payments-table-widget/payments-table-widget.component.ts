import moment from 'moment';
import { Component, OnChanges, SimpleChanges, Input } from '@angular/core';
import { MonthPaymentsStat } from './month-payments-stat.model';

@Component({
  selector: 'payments-table-widget',
  templateUrl: './payments-table-widget.component.html',
  styleUrls: ['./payments-table-widget.component.scss']
})
export class PaymentsTableWidgetComponent implements OnChanges {
  @Input() paymentsData: MonthPaymentsStat[];
  currentMonthAmount: number;
  lastMonthGrowth: number = 0;
  currentMonth: string = moment.utc().format('MMMM YYYY');


  ngOnChanges(changes: SimpleChanges) {
    if (changes['paymentsData'] && this.paymentsData) {
      this.currentMonthAmount = this.paymentsData[this.paymentsData.length - 1].amount_sum;
      let lastMonthAmount = this.paymentsData[this.paymentsData.length - 2].amount_sum;
      if (lastMonthAmount > 0 && this.currentMonthAmount) {
      }
      this.lastMonthGrowth = this.findIncrease(lastMonthAmount, this.currentMonthAmount);
    }
  }

  private findIncrease(prev: number, current: number): number {
    if (prev === 0 && current === 0) {
      return 0;
    }
    if (prev === 0 && current) {
      return 100;
    }
    return Math.round(((current - prev) / prev * 100));
  }


}
