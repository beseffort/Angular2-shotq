import { Routes } from '@angular/router';
import { ContractTemplatesComponent } from './contract-templates/contract-templates/contract-templates.component';
import { ContractTemplateAddComponent } from './contract-templates/contract-template-add/contract-template-add.component';
import { CanDeactivateChangesGuard } from '../shared/guards/can-deactivate-changes.guard';
import { SettingsComponent } from './settings.component';
import { ProposalTemplatesComponent } from './proposal-templates';
import { EmailTemplatesComponent } from './email-templates/email-templates/email-templates.component';
import { ProductsComponent } from './products';
import { ProductItemsListComponent } from './items-list';
import { PackageTemplateListComponent } from './package-template-list';
import { EmailTemplateAddComponent } from './email-templates/email-template-add/email-template-add.component';
import { UserProfileSettingsComponent } from './account/user-profile/user-profile.component';
import { CompanySettingsComponent } from './account/company/company.component';
import { PaymentAndInvoicesComponent } from './payment/payment.component';
import { TeamComponent } from './team/team.component';
import { WorkerProfileSettingsComponent } from './team/worker-profile/worker-profile.component';
import { JobRolesComponent } from './jobs/job-roles/job-roles.component';
import { JobTypesComponent } from './jobs/job-types/job-types.component';
import { EventTypesComponent } from './jobs/event-types';



const TEMPLATES_ROUTES: Routes = [
  {
    path: 'contract',
    children: [
      {
        path: '', component: ContractTemplatesComponent
      },
      {
        path: 'add',
        component: ContractTemplateAddComponent,
        canDeactivate: [CanDeactivateChangesGuard]
      },
      {
        path: ':id',
        component: ContractTemplateAddComponent,
        canDeactivate: [CanDeactivateChangesGuard]
      },
    ]
  },
  {
    path: 'proposal',
    children: [
      {
        path: '', component: ProposalTemplatesComponent
      }
    ]
  },
  {
    path: 'email',
    children: [
      {
        path: '', component: EmailTemplatesComponent
      },
      {
        path: 'add',
        component: EmailTemplateAddComponent
      },
      {
        path: ':id',
        component: EmailTemplateAddComponent
      }
    ]
  }

];

const PRODUCTS_ROUTES: Routes = [
  {
    path: 'products',
    component: ProductsComponent,
    children: [
      {
        path: '', redirectTo: 'items', pathMatch: 'full'
      },
      {
        path: 'items', component: ProductItemsListComponent
      },
      {
        path: 'packages', component: PackageTemplateListComponent
      }
    ]
  }
];

const TEAM_ROUTES: Routes = [
  {
    path: 'team',
    children: [
      {
        path: '', component: TeamComponent
      },
      {
        path: ':id',
        component: WorkerProfileSettingsComponent
      },
    ]
  }
];

const ACCOUNT_ROUTES: Routes = [
   {
     path: 'profile',
     component: UserProfileSettingsComponent,
     canDeactivate: [CanDeactivateChangesGuard]
   },
  {
    path: 'company',
    component: CompanySettingsComponent,
    canDeactivate: [CanDeactivateChangesGuard]
  },
];

const JOBS_ROUTES: Routes = [
   {
     path: 'job-roles',
     component: JobRolesComponent,
     canDeactivate: [CanDeactivateChangesGuard]
   },
   {
     path: 'job-types',
     component: JobTypesComponent,
     canDeactivate: [CanDeactivateChangesGuard]
   },
   {
     path: 'event-types',
     component: EventTypesComponent,
     canDeactivate: [CanDeactivateChangesGuard]
   }
];


export const SETTINGS_ROUTES = [
  {path: '', component: SettingsComponent},
  {path: 'templates', children: TEMPLATES_ROUTES},
  {path: 'payment-and-invoices', component: PaymentAndInvoicesComponent},
  ...ACCOUNT_ROUTES,
  ...TEAM_ROUTES,
  ...PRODUCTS_ROUTES,
  ...JOBS_ROUTES
];
