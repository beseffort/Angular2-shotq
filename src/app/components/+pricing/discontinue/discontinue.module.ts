import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DiscontinueComponent } from './discontinue.component';
import { FormsModule } from '@angular/forms';
import { CommonModule }                    from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [DiscontinueComponent],
  exports: [DiscontinueComponent]
})
export class DiscontinueModule {}
