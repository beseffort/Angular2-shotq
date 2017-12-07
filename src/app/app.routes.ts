/* Component to be used for inner components */
import { InnerComponent }                  from './components/inner/inner.component';
/* Component to be used for outer components */
import { OuterComponent }                  from './components/outer/outer.component';
/* General components routes */
import { Home }                            from './components/home';
import { EventsComponent }                 from './components/events';
import { NoContentComponent }              from './components/no-content';
import { NoAuthorizedComponent }           from './components/no-authorized';
import { PackageTemplateEditorComponent }  from './components/+proposals/package/package-template-editor';
/* Login */
import { LogInComponent }                  from './components/+access/log-in';
import { SignUpComponent }                 from './components/+access/sign-up/sign-up.component';
import { ForgotPasswordComponent }         from './components/+access/forgot-password/forgot-password.component';
import { ChangePasswordComponent }         from './components/+access/change-password/change-password.component';
/* Services */
import { AccessService }                   from './services/access/access.service';
/* Other */
import { BOOKING_ROUTES }                  from './components/+booking/booking.routes';
import { SETTINGS_ROUTES } from './components/+settings/settings.routes';
import { CALENDAR_ROUTES } from './components/+calendar/calendar.routes';

/**
 * INNER_ROUTES
 *
 * Routes that require authentication to be displayed to the user.
 *
 * @type {Array}
 */
const INNER_ROUTES = [
  /* General */
  { path: '',                                          component: Home },
  { path: 'dashboard', loadChildren: './components/dashboard/dashboard.module#DashboardModule' },
  { path: 'home',                                      component: Home },
  /* Contacts Lazy Loaded */
  { path: 'contacts',                                  loadChildren: './components/+contacts/contacts.module#ContactsModule' },
  /* Contracts Lazy Loaded */
  { path: 'contracts',                                 loadChildren: './components/+contracts/contracts.module#ContractsModule' },
  /* Events */
  { path: 'events',                                    component: EventsComponent },
  /* Jobs */
  { path: 'jobs',                                      loadChildren: './components/+jobs/jobs.module#JobsModule' },
  /* Proposals */
  { path: 'proposals/package-template/add',            component: PackageTemplateEditorComponent },
  { path: 'proposals/package-template/edit/:id',       component: PackageTemplateEditorComponent },
  /* Booking */
  { path: 'booking',                                   children: BOOKING_ROUTES },
  /* Calendar */
  { path: 'calendar',                                   children: CALENDAR_ROUTES },
  /* Pricing Lazy Loaded */
  { path: 'pricing',                                   loadChildren: './components/+pricing/pricing.module#PricingModule' },
  { path: 'settings', children: SETTINGS_ROUTES},
  /* No-Content */
  { path: '**',                                        component: NoContentComponent },
];

/**
 * OUTER_ROUTES
 *
 * Routes that doesn't require authentication to be displayed to the user.
 *
 * @type {Array}
 */
const OUTER_ROUTES = [
  { path: 'login', component: LogInComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'forgot-password/:key', component: ChangePasswordComponent },
  { path: 'set-password/:signed_id', component: ChangePasswordComponent },
  { path: 'not-authorized', component: NoAuthorizedComponent },
  /* Client Access Lazy Loaded */
  { path: 'public/client-access', loadChildren: './components/+client-access/client-access.module#ClientAccessModule' },
  { path: 'booking', children: BOOKING_ROUTES },
  { path: '', redirectTo: '/contacts', pathMatch: 'full' },
];
/**
 * Routes
 *
 * @type {Array}
 */
export const ROUTES = [
  {
    path: '',
    component: OuterComponent,
    children: [
      ...OUTER_ROUTES,
    ]
  },
  {
    path: '',
    component: InnerComponent,
    canActivate: [AccessService],
    children: [
      ...INNER_ROUTES,
    ],
  },

  {path: '**', component: NoContentComponent, canActivate: [AccessService]},
];
