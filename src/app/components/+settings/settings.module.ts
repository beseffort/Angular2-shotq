import { NgModule } from '@angular/core';
import { AccordionModule } from 'ngx-accordion';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';

import { FileUploadModule } from 'ng2-file-upload';
import { CustomFormsModule } from 'ng2-validation';
import {
  ContractTemplateAddComponent,
  ContractTemplatesComponent,
  TemplateVariablesComponent
} from './contract-templates';
import { ProposalTemplatesComponent } from './proposal-templates';
import { SettingsComponent } from './settings.component';
import { ProductsComponent } from './products';
import {
  CategoryItemsComponent,
  DeleteProductCategoriesComponent,
  ManageProductCategoriesComponent,
  ProductsSearchFormComponent
} from './base-product-list';
import { ProductItemsListComponent } from './items-list';
import { PackageTemplateListComponent } from './package-template-list';
import { TemplateColorPipe } from './template-color-pipe';
import { EmailTemplatesComponent } from './email-templates';
import {
  EmailTemplateAttachmentsService,
  EmailTemplateService
} from '../../services/email-template/email-template.service';
import { PreventClickModule } from '../../directives/prevent-click';
import { AutosizeModule } from '../../directives/autosize';
import { EmailTemplateAddComponent } from './email-templates/email-template-add/email-template-add.component';
import { UserProfileSettingsComponent } from './account/user-profile/user-profile.component';
import { CompanySettingsComponent } from './account/company/company.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TemplateVariableService } from '../../services/template-variable/template-variable.service';
import { ProposalTemplateService } from '../../services/proposal-template';
import { ContractTemplateService } from '../../services/contract-template/contract-template.service';
import { GeneralFunctionsService } from '../../services/general-functions/general-functions.service';
import { MakeDraggable } from './contract-templates/template-variables/template-variable-dragable';
import { SharedModule } from '../shared/shared.module';
import { EditableLabelModule } from '../shared/editable-label';
import { DropdownSelectModule } from '../shared/dropdown-select/dropdown-select.module';
import { PipesModule } from '../../pipes/pipes.module';
import { MerchantAccountsComponent, MerchantFormComponent } from 'app/components/+settings/payment/merchant-accounts';
import { EmailTemplatePreviewComponent } from './email-templates/email-template-preview/email-template-preview.component';
import { TeamComponent } from './team/team.component';
import { WorkerProfileSettingsComponent } from './team/worker-profile/worker-profile.component';
import { DiscountTemplatesComponent } from './payment/discount-templates/discount-templates/discount-templates.component';
import { PaymentAndInvoicesComponent } from './payment/payment.component';
import { DiscountTemplateAddComponent } from './payment/discount-templates/discount-template-add/discount-template-add.component';
import { WorkerInlineComponent } from './team/worker-inline/worker-inline.component';
import { TaxesTemplatesComponent } from './payment/taxes-templates/taxes-templates/taxes-templates.component';
import { ScheduleTemplatesComponent } from './payment/schedule-templates/schedule-templates/schedule-templates.component';
import { ScheduleTemplateAddComponent } from './payment/schedule-templates/schedule-template-add/schedule-template-add.component';
import { ProposalsModule } from '../+proposals/proposals.module';
import { TaxesTemplateAddComponent } from './payment/taxes-templates/taxes-template-add';
import { PayWithCheckModal } from './payment/modal';
import { JobRolesComponent } from './jobs/job-roles/job-roles.component';
import { SQModalModule } from '../sq-modal/sq-modal.module';
import { JobTypesComponent } from './jobs/job-types/job-types.component';
import { EventTypesComponent } from './jobs/event-types';
import { ColorPickerModule } from 'ngx-color-picker';
import { InvitationInlineComponent } from './team/invitation-inline/invitation-inline.component';
import { InvitationModalComponent } from './team/invitation-modal/invitation-modal.component';
import { JobUiModule } from '../shared/jobs-ui/jobs-ui.module';


@NgModule({
  imports: [
    JobUiModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AccordionModule,
    SharedModule,
    EditableLabelModule,
    DropdownSelectModule,
    PipesModule,
    RouterModule,
    PreventClickModule,
    AutosizeModule,
    BsDropdownModule.forRoot(),
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    FileUploadModule,
    CustomFormsModule,
    ProposalsModule,
    SQModalModule,
    ColorPickerModule
  ],
  declarations: [
    InvitationModalComponent,
    SettingsComponent,
    ContractTemplatesComponent,
    ContractTemplateAddComponent,
    TemplateVariablesComponent,
    MakeDraggable,
    ProposalTemplatesComponent,
    EmailTemplatesComponent,
    TemplateColorPipe,
    ProductsComponent,
    ProductItemsListComponent,
    TeamComponent,
    WorkerProfileSettingsComponent,
    WorkerInlineComponent,
    InvitationInlineComponent,
    PackageTemplateListComponent,
    CategoryItemsComponent,
    ProductsSearchFormComponent,
    ManageProductCategoriesComponent,
    DeleteProductCategoriesComponent,
    EmailTemplateAddComponent,
    EmailTemplatePreviewComponent,
    DiscountTemplatesComponent,
    DiscountTemplateAddComponent,
    TaxesTemplatesComponent,
    TaxesTemplateAddComponent,
    ScheduleTemplatesComponent,
    ScheduleTemplateAddComponent,
    PaymentAndInvoicesComponent,

    UserProfileSettingsComponent,
    CompanySettingsComponent,

    MerchantAccountsComponent,
    MerchantFormComponent,
    PayWithCheckModal,
    JobRolesComponent,
    JobTypesComponent,
    EventTypesComponent
  ],
  exports: [
    TemplateVariablesComponent,
    PaymentAndInvoicesComponent,
  ],
  providers: [
    TemplateVariableService,
    ContractTemplateService,
    GeneralFunctionsService,
    ProposalTemplateService,
    EmailTemplateService,
    EmailTemplateAttachmentsService
  ],
  entryComponents: [
    ManageProductCategoriesComponent,
    DeleteProductCategoriesComponent,
    PayWithCheckModal,
    InvitationModalComponent
  ]
})
export class SettingsModule {
}
