import { Routes } from '@angular/router';
import { AccountComponent } from './account/';
import { CommunicationComponent } from './communication/';
import { OverviewComponent } from './overview/';
import { ClientPageComponent } from './client-page';
import { ClientAccessAuthGuard } from '../../services/access';
import { JobResolver } from '../+jobs/job.resolver';
import { InvoicesComponent } from '../shared/invoices/invoices.component';

export const CLIENT_ACCESS_ROUTES: Routes = [
  {
    path: ':id',
    component: ClientPageComponent,
    resolve: {
      job: JobResolver
    },
    canActivate: [ClientAccessAuthGuard],
    children: [
      {path: 'account', component: AccountComponent},
      {path: 'communication', component: CommunicationComponent},
      {path: 'invoices', component: InvoicesComponent},
      {path: 'overview', component: OverviewComponent}
    ]
  }
];
