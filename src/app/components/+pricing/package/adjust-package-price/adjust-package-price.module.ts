import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AdjustPackagePriceComponent } from './adjust-package-price.component';
import { MdRadioModule } from '@angular2-material/radio';
import { FormsModule } from '@angular/forms';
import { CommonModule }                    from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    MdRadioModule,
    FormsModule
  ],
  declarations: [AdjustPackagePriceComponent],
  exports: [AdjustPackagePriceComponent]
})
export class AdjustPackagePriceModule {}
