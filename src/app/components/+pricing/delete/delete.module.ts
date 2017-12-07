import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DeleteComponent } from './delete.component';
import { FormsModule } from '@angular/forms';
import { CommonModule }                    from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [DeleteComponent],
  exports: [DeleteComponent]
})
export class DeleteModule {}
