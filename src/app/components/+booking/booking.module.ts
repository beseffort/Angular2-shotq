import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule }                    from '@angular/common';

import { BOOKING_WIZARD_COMPONENTS } from './booking-wizard';
import { BookingWelcomeScreenComponent } from './welcome-screen';
import { SpinnerModule } from '../shared/spinner';
import { DropdownSelectModule } from '../shared/dropdown-select/dropdown-select.module';
import { PipesModule } from '../../pipes/pipes.module';
import { RouterModule } from '@angular/router';
import { ProposalResolver } from './proposal.resolver';
import { ContractService } from '../../services/contract/contract.service';
import { ModalService } from '../../services/modal/modal.service';
import { GoogleAddressModule } from '../../directives/google-address';
import { SharedModule } from '../shared/shared.module';
import { SignatureResolver } from './client-signature.service';
import { ContractPreviewModule } from '../+contracts/contract-preview/contract-preview.module';
import { ProposalScheduleResolver } from './proposal-schedule.resolver';
import { SQModalModule } from '../sq-modal/sq-modal.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    SpinnerModule,
    DropdownSelectModule,
    ContractPreviewModule,
    PipesModule,
    SharedModule,
    SQModalModule,
    GoogleAddressModule
  ],
  declarations: [
    BookingWelcomeScreenComponent,
    ...BOOKING_WIZARD_COMPONENTS
  ],
  exports: [
    BookingWelcomeScreenComponent,
    ...BOOKING_WIZARD_COMPONENTS
  ],
  providers: [
    ProposalResolver,
    ProposalScheduleResolver,
    ContractService,
    ModalService,
    SignatureResolver
  ]
})
export class BookingModule { }
