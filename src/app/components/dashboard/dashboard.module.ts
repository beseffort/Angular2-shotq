import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { D3Service } from 'd3-ng2-service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { EventGroupService } from '../../services/event-group';
import { JobService } from '../../services/job';
import { InvoiceService } from '../../services/client-access/billing/billing.service';
import { AppliedPaymentService } from '../../services/applied-payment';

import { DASHBOARD_ROUTES } from './dashboard.routes';
import { WIDGETS_COMPONENTS } from './widgets';
import { DashboardComponent } from './dashboard.component';
import { DashboardScheduleComponent } from './dashboard-schedule';
import { DashboardJobActivityComponent } from './job-activity';
import { DashboardTasksComponent } from './dashboard-tasks';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    BsDropdownModule.forRoot(),
    RouterModule.forChild(DASHBOARD_ROUTES),
    SharedModule
  ],
  declarations: [
    DashboardComponent,
    DashboardScheduleComponent,
    DashboardJobActivityComponent,
    DashboardTasksComponent,
    ...WIDGETS_COMPONENTS
  ],
  providers: [
    D3Service,
    JobService,
    EventGroupService,
    InvoiceService,
    AppliedPaymentService
  ]
})
export class DashboardModule { }
