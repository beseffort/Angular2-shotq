import { Routes } from '@angular/router';
import { BookingWizardComponent } from './booking-wizard/booking-wizard.component';
import { BookingWelcomeScreenComponent } from './welcome-screen/welcome-screen.component';
import { ProposalResolver } from './proposal.resolver';
import { ClientAccessAuthGuard } from '../../services/access';
import { SignatureResolver } from './client-signature.service';

export const BOOKING_ROUTES: Routes = [
  {
    path: ':id',
    resolve: {
      proposal: ProposalResolver
    },
    canActivate: [ ClientAccessAuthGuard ],
    children: [
      {
        path: 'welcome',
        component: BookingWelcomeScreenComponent,
        data: {message: 'welcome'},
        resolve: {signature: SignatureResolver}
      },
      {
        path: 'thank-you',
        component: BookingWelcomeScreenComponent,
        data: {message: 'thankyou'}
      },
      {
        path: 'accepted',
        component: BookingWelcomeScreenComponent,
        data: {message: 'proposal_accepted'}
      },
      {path: '', component: BookingWizardComponent},
    ]
  },
];
