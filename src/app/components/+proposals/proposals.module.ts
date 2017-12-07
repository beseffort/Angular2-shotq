import { NgModule } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

import { NgxMyDatePickerModule } from 'ngx-mydatepicker';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';

import { ItemService } from '../../services/product/item';
import { ItemOptionGroupService } from '../../services/product/item-option-group';
import { ItemTemplateService } from '../../services/product/item-template';
import { ItemCategoryService } from '../../services/product/item-category';
import { PackageService } from '../../services/product/package';
import { PackageTemplateService } from '../../services/product/package-template';
import { PackageCategoryService } from '../../services/product/package-category';
import { MerchantAccountService } from '../../services/merchant-account';
import { BookingLinkService } from '../../services/booking-link';
import { ProposalSchedulePaymentService } from '../../services/proposal-schedule-payment';
import { ProposalSchedulePaymentTemplateService } from '../../services/proposal-schedule-payment-template';
import { ProposalSettingTemplatesService } from '../../services/proposal-setting-templates';
import { ProposalService } from '../../services/proposal';
import { FlashMessageService } from '../../services/flash-message';
import { StateSaverService } from '../../services/state-saver';
import { DragulaScrollerDirective } from '../../directives/dragula-scroller';
import { HoverClassDirective } from '../../directives/hover-class';
import { PreventClickModule } from '../../directives/prevent-click';

/* Components */
import {
  ProposalReceivePaymentComponent,
  SchedulePaymentComponent,
  ProposalSchedulePaymentFormComponent,
  ScheduleSelectedPaymentFormComponent,
  SchedulePresetFormComponent,
  PackagesFilterComponent,
  SelectedPackagesComponent,
  PackageTemplatesComponent,
  ProposalSettingTemplatesComponent,
  ProposalEditorComponent
}  from './proposal-editor';
import {
  PackageDescriptionFormComponent,
  PackageTemplateAddonsComponent,
  PackageAllItems,
  PackageItemsCalculator
} from './package/package-shared';
import {
  PackageTemplateContentsComponent,
  PackageTemplateEditorComponent
}  from './package/package-template-editor';
import {
  PackageContentsComponent,
  PackageAddonsComponent,
  ItemOptionsComponent,
  PackageEditorComponent
}  from './package/package-editor';

/* Modules */
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';
import { ModalModule } from 'ngx-bootstrap';
import { WorkerService } from '../../services/worker/worker.service';
import { ContractTemplateService } from '../../services/contract-template/contract-template.service';
import { ProposalDiscountsComponent, ProposalDiscountFormComponent } from './proposal-editor/proposal-discounts';
import { ProposalTaxesComponent } from './proposal-editor/proposal-taxes/proposal-taxes.component';
import { ProposalExpirationComponent } from './proposal-editor/proposal-expiration/proposal-expiration.component';
import { ProposalTaxFormComponent } from './proposal-editor/proposal-taxes/proposal-tax-form/proposal-tax-form.component';
import { ProposalSendComponent } from './proposal-editor/proposal-send/proposal-send.component';
import { SharedModule } from '../shared/shared.module';
import { DropdownModule }               from 'ngx-dropdown';
import { DropdownSelectModule } from '../shared/dropdown-select/dropdown-select.module';
import { CommonModule }                    from '@angular/common';
import { TemplateVariableService } from '../../services/template-variable/template-variable.service';
import { SpinnerModule } from '../shared/spinner/spinner.module';
import { ProposalResolver } from 'app/components/+booking/proposal.resolver';
import { ContractsAddModule } from '../+contracts/contracts-add/contracts-add.module';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  providers: [
    ItemService,
    TemplateVariableService,
    ItemOptionGroupService,
    ItemTemplateService,
    ItemCategoryService,
    PackageTemplateService,
    PackageCategoryService,
    PackageService,
    MerchantAccountService,
    BookingLinkService,
    ProposalService,
    ProposalSchedulePaymentService,
    ProposalSchedulePaymentTemplateService,
    ProposalSettingTemplatesService,
    FlashMessageService,
    StateSaverService,
    WorkerService,
    ContractTemplateService,
    ProposalResolver
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    ModalModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    DragulaModule,
    NgxMyDatePickerModule,
    MultiselectDropdownModule,
    DropdownSelectModule,
    SpinnerModule,
    PreventClickModule,
    ContractsAddModule,
    PipesModule
  ],
  declarations: [
    DragulaScrollerDirective,
    HoverClassDirective,
    ProposalReceivePaymentComponent,
    ProposalSchedulePaymentFormComponent,
    ScheduleSelectedPaymentFormComponent,
    SchedulePresetFormComponent,
    SchedulePaymentComponent,
    PackagesFilterComponent,
    SelectedPackagesComponent,
    PackageTemplatesComponent,
    ProposalSettingTemplatesComponent,
    ProposalEditorComponent,
    PackageDescriptionFormComponent,
    PackageTemplateContentsComponent,
    PackageTemplateAddonsComponent,
    PackageAddonsComponent,
    PackageAllItems,
    PackageItemsCalculator,
    PackageTemplateEditorComponent,
    PackageContentsComponent,
    ItemOptionsComponent,
    PackageEditorComponent,
    ProposalDiscountsComponent,
    ProposalDiscountFormComponent,
    ProposalTaxesComponent,
    ProposalTaxFormComponent,
    ProposalExpirationComponent,
    ProposalSendComponent
  ],
  exports: [
    ProposalReceivePaymentComponent,
    ProposalSchedulePaymentFormComponent,
    SchedulePresetFormComponent,
    SchedulePaymentComponent,
    PackagesFilterComponent,
    SelectedPackagesComponent,
    PackageTemplatesComponent,
    ProposalEditorComponent,
    PackageDescriptionFormComponent,
    PackageTemplateContentsComponent,
    PackageTemplateAddonsComponent,
    PackageAddonsComponent,
    PackageAllItems,
    PackageItemsCalculator,
    PackageTemplateEditorComponent,
    PackageContentsComponent,
    ItemOptionsComponent,
    PackageEditorComponent
  ],
})
export class ProposalsModule {
}
