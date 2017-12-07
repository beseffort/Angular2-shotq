import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule }                    from '@angular/common';
import { FormFieldModule } from '../../shared/form-field';
import { FormNgSelectWrapModule } from '../../shared/form-ng-select-wrap';
import { ChooseContactModule } from '../../shared/choose-contact/choose-contact.module';
import { ContractPreviewComponent } from './contract-preview.component';
import { PipesModule } from '../../../pipes/pipes.module';
import { ContractSignatureComponent } from './signature/contract-signature.component';
import { SharedModule } from '../../shared/shared.module';
import { ContractPreviewModalComponent } from './contract-preview-modal/contract-preview-modal.component';

@NgModule({
  imports: [
    CommonModule,
    PipesModule,
    FormsModule,
    FormFieldModule,
    FormNgSelectWrapModule,
    ReactiveFormsModule,
    ChooseContactModule
  ],
  declarations: [
    ContractPreviewComponent,
    ContractSignatureComponent,
    ContractPreviewModalComponent
  ],
  exports: [
    ContractPreviewComponent,
    ContractPreviewModalComponent
  ],
  entryComponents: [
    ContractPreviewModalComponent
  ]
})
export class ContractPreviewModule {
}
