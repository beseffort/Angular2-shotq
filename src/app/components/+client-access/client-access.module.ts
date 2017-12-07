import { NgModule } from '@angular/core';
import { AccountComponent } from './account/';
import { CommunicationComponent } from './communication/';
import { OverviewComponent } from './overview/';
import { ClientPageComponent } from './client-page';
import { RouterModule } from '@angular/router';
import { DropdownModule } from 'ngx-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared';
import { TooltipModule } from 'ngx-bootstrap';
import { PipesModule } from '../../pipes/pipes.module';
import { CustomDropdownModule } from '../shared/dropdown';
import { ClientAccessAuthGuard } from '../../services/access';
import { SentCorrespondenceService } from '../../services/sent-correspondence';
import { CommonModule } from '@angular/common';
import { GoogleAddressModule } from '../../directives/google-address';
/* Routes */
import { CLIENT_ACCESS_ROUTES } from './client-access.routes';
import { ClientUserEditComponent } from './account/client-user-edit';
import { JobsModule } from 'app/components/+jobs';
import { MessagingUiModule } from '../shared/messaging-ui/messaging-ui.module';
import { MerchantPayModalComponent } from '../+jobs/jobs-info/invoices/merchant-pay-modal/merchant-pay-modal.component';

@NgModule({
  providers: [
    SentCorrespondenceService,
    ClientAccessAuthGuard
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(CLIENT_ACCESS_ROUTES),
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    JobsModule,
    MessagingUiModule,
    SharedModule,
    TooltipModule.forRoot(),
    PipesModule,
    CustomDropdownModule,
    GoogleAddressModule
  ],
  declarations: [
    AccountComponent,
    CommunicationComponent,
    OverviewComponent,
    ClientPageComponent,
    ClientUserEditComponent
  ],
  exports: [
    AccountComponent,
    CommunicationComponent,
    OverviewComponent
  ],
  entryComponents: [
    ClientUserEditComponent,
  ]
})
export class ClientAccessModule {
}
