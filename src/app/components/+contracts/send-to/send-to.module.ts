import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SendToComponent } from './send-to.component';
import { MdRadioModule } from '@angular2-material/radio';
import { FormsModule } from '@angular/forms';
import { CommonModule }                    from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    MdRadioModule,
    FormsModule
  ],
  declarations: [SendToComponent],
  exports: [SendToComponent]
})
export class SendToModule {}
