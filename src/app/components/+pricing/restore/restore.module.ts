import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RestoreComponent } from './restore.component';
import { FormsModule } from '@angular/forms';
import { CommonModule }                    from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [RestoreComponent],
  exports: [RestoreComponent]
})
export class RestoreModule {}
