import { Component } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

import * as _ from 'lodash';

import { ActivityService } from '../../../services/activity/activity.service';
import { BSModalContext } from 'single-angular-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from 'single-angular-modal';
import { GroupByPipe } from '../../../../pipes/group-by/group-by.pipe';


export class ActivitiesModalWindowData extends BSModalContext {
  public activities: Array<any>;
}


@Component({
  templateUrl: './activities-modal.component.html',
  styleUrls: ['./../activity-feed.component.scss', './activities-modal.component.scss'],
  providers: [GroupByPipe]
})
export class ActivitiesModalComponent implements ModalComponent<ActivitiesModalWindowData>   {
  activities: any[] = [];
  groupedActivities: {} = {};

  _: any = _;

  constructor(public dialog: DialogRef<ActivitiesModalWindowData>,
              private groupByPipe: GroupByPipe,
              private router: Router) {
    dialog.context.isBlocking = false;
    this.router.events.subscribe((navigationStart: NavigationStart) => {
      document.querySelector('body').classList.remove('modal-open');
    });
  }

  public ngOnInit() {
    this.activities = this.dialog.context.activities;

    let activities = _.cloneDeep(this.activities);
    _.forEach(activities, (item) => {
      item.publishedDate = /\d{4}-\d{2}-\d{2}/.exec(item.published)[0];
    });
    this.groupedActivities = this.groupByPipe.transform(activities, 'publishedDate');
  }

  public dismiss() {
    this.dialog.dismiss();
  }
}
