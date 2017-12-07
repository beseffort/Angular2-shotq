import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DropdownModule } from 'ngx-dropdown';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule, PaginationModule } from 'ngx-bootstrap';
import { SharedModule } from '../shared';
import { FormFieldModule } from '../shared/form-field';
import { FormFieldAddressModule } from '../shared/form-field-address';
import { FormNgSelectWrapModule } from '../shared/form-ng-select-wrap';
import { FBModule } from '../shared/material/floating-button';
import { FABToolbarModule } from '../shared/material/fab-toolbar';
import { MdCheckboxModule } from '@angular2-material/checkbox';
import { ContractsListComponent } from './contracts-list/contracts-list.component';
import { FilterPanelComponent } from './filter-panel/filter-panel.component';

import { DragulaModule } from 'ng2-dragula/ng2-dragula';
import { ContractEditComponent } from './contract-edit';
import { ContractTemplate } from '../../models/contract-template.model';
import { GeneralFunctionsService } from '../../services/general-functions/general-functions.service';
import { ContractSendComponent } from './contract-send/contract-send.component';
import { ContractService, SignatureService } from '../../services';
import { PerfectScrollbarConfigInterface, PerfectScrollbarModule } from 'angular2-perfect-scrollbar';
import { PipesModule } from '../../pipes/pipes.module';
import { CustomDropdownModule } from '../shared/dropdown';

import { CONTRACTS_ROUTES } from './contracts.routes';
import { SettingsModule } from '../+settings/settings.module';
import { ContractPreviewModalComponent } from './contract-preview/contract-preview-modal/contract-preview-modal.component';
import { ContractPreviewModule } from './contract-preview/contract-preview.module';
import { SQModalModule } from '../sq-modal/sq-modal.module';
import { MessagingUiService } from '../shared/messaging-ui/messaging-ui.service';

const PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  // suppressScrollX: true
};

@NgModule({
  imports: [
    PerfectScrollbarModule.forRoot(PERFECT_SCROLLBAR_CONFIG),
    RouterModule.forChild(CONTRACTS_ROUTES),
    CommonModule,
    FormsModule,
    DropdownModule,
    PaginationModule.forRoot(),
    FormFieldModule,
    SharedModule,
    FormFieldAddressModule,
    FormNgSelectWrapModule,
    FBModule,
    FABToolbarModule,
    MdCheckboxModule,
    ReactiveFormsModule,
    DragulaModule,
    PipesModule,
    ModalModule,
    CustomDropdownModule,
    SettingsModule,
    ContractPreviewModule,
    SQModalModule
  ],
  declarations: [
    ContractsListComponent,
    ContractEditComponent,
    ContractSendComponent,
    FilterPanelComponent,
  ],
  exports: [],
  providers: [
    GeneralFunctionsService,
    ContractService,
    ContractTemplate,
    MessagingUiService,
    SignatureService
  ],
  entryComponents: [
    ContractPreviewModalComponent
  ]
})
export class ContractsModule {
}
