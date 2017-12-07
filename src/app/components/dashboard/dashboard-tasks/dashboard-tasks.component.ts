import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'dashboard-tasks',
  templateUrl: './dashboard-tasks.component.html',
  styleUrls: ['./dashboard-tasks.component.scss']
})
export class DashboardTasksComponent implements OnInit {
  items: string[] = [
    'Upcoming Tasks',
    'All tasks'];

  constructor() { }

  ngOnInit() { }

}
