import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'dashboard-count-widget',
  templateUrl: './count-widget.component.html',
  styleUrls: ['./count-widget.component.scss']
})
export class DashboardCountWidgetComponent implements OnInit {
  @Input() title: string;
  @Input() link: string;
  @Input() count: number;
  @Input() backgroundClass: string;

  constructor() { }

  ngOnInit() { }

}
