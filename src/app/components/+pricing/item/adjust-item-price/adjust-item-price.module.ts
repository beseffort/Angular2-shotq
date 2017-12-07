import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AdjustItemPriceComponent } from './adjust-item-price.component';
import { MdRadioModule } from '@angular2-material/radio';
import { FormsModule } from '@angular/forms';
import { CommonModule }                    from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    MdRadioModule,
    FormsModule
  ],
  declarations: [AdjustItemPriceComponent],
  exports: [AdjustItemPriceComponent]
})
export class AdjustItemPriceModule {}
