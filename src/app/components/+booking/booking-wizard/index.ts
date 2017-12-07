import { BookingPackagesComponent } from './booking-packages';
import { BookingAddonsComponent } from './booking-addons';
import { BookingEventDetailsComponent } from './booking-event-details';
import { BookingOverviewComponent } from './booking-overview';
import { BookingPaymentComponent } from './booking-payment';
import { BookingWizardComponent } from './booking-wizard.component';
import { BookingAddonFormComponent } from './booking-addons/booking-addon-form';
import { SchedulePaymentTableComponent } from './schedule-payment-table';
import { BookingSignComponent } from './booking-sign/booking-sign.component';

export { BookingWizardComponent } from './booking-wizard.component';

export const BOOKING_WIZARD_COMPONENTS = [
  BookingPackagesComponent,
  BookingAddonsComponent,
  BookingAddonFormComponent,
  BookingEventDetailsComponent,
  SchedulePaymentTableComponent,
  BookingOverviewComponent,
  BookingPaymentComponent,
  BookingWizardComponent,
  BookingSignComponent
];
