import moment from 'moment';
import {
  Component, OnChanges, SimpleChanges,
  ElementRef, Input, ViewEncapsulation } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { D3Service, D3, Selection } from 'd3-ng2-service';
import { MonthPaymentsStat } from '../month-payments-stat.model';

@Component({
  selector: 'income-payments-chart',
  templateUrl: './income-payments-chart.component.html',
  styleUrls: ['./income-payments-chart.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class IncomePaymentsChartComponent implements OnChanges {
  @Input() chartData: MonthPaymentsStat[];
  private d3: D3;
  private parentNativeElement: HTMLDivElement;

  constructor(
    elm: ElementRef,
    d3Service: D3Service
  ) {
    this.d3 = d3Service.getD3();
    this.parentNativeElement = elm.nativeElement;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['chartData'] && this.chartData) {
      this.renderChart();
    }
  }

  private renderChart() {
    let d3 = this.d3;
    let d3ParentElement: Selection<any, any, any, any>;
    d3ParentElement = d3.select(this.parentNativeElement);
    let margin = {top: 20, right: 20, bottom: 30, left: 40};
    let width = this.parentNativeElement.clientWidth - margin.left - margin.right;
    let height = this.parentNativeElement.clientHeight - margin.top - margin.bottom;
    let x = d3.scaleBand().range([0, width]).padding(0.85);
    let y = d3.scaleLinear().range([height, 0]);

    let svg = d3ParentElement.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // define gradient
    let gradient = svg.append('svg:defs')
      .append('svg:linearGradient')
      .attr('id', 'gradient')
      .attr('x1', '50%')
      .attr('y1', '0%')
      .attr('x2', '50%')
      .attr('y2', '100%')
      .attr('spreadMethod', 'pad');

    gradient.append('svg:stop')
      .attr('offset', '0%')
      .attr('stop-color', '#e75050')
      .attr('stop-opacity', 1);

    gradient.append('svg:stop')
      .attr('offset', '100%')
      .attr('stop-color', '#f7ae18')
      .attr('stop-opacity', 1);

    // Scale the range of the data in the domains
    x.domain(this.chartData.map(d => moment.utc(d.month).format('MMM')));
    let maximumY = d3.max(this.chartData, d => d.amount_sum) || 1500;
    y.domain([-(maximumY * .02), maximumY]);

    // append the rectangles for the bar chart
    let currencyPipe = new CurrencyPipe('en');
    svg.selectAll('.bar')
      .data(this.chartData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(moment.utc(d.month).format('MMM')))
      .attr('width', x.bandwidth())
      .attr('y', (d) => y(d.amount_sum))
      .attr('height', (d) => height - y(d.amount_sum))
      .attr('fill', 'url(#gradient)')
      .append('svg:title')
      .text(d => currencyPipe.transform(d.amount_sum, 'USD', true));

    // add the x Axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .attr('class', 'chartAxis axisX')
      .call(d3.axisBottom(x))
      .selectAll('line,.domain').remove();

    // add the y Axis
    let customYAxis = (g) => {
      g.call(
        d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat((amountSum: number) => {
          if (amountSum >= 1000) {
            return d3.format('$.2s')(amountSum);
          } else {
            return `$${Math.round(amountSum)}`;
          }
        })
      );
      g.select('.domain').remove();
      g.selectAll('.tick:not(:first-of-type) line').attr('stroke', '#777');
    };
    svg.append('g')
      .call(customYAxis)
      .attr('class', 'chartAxis axisY');
  }

}
