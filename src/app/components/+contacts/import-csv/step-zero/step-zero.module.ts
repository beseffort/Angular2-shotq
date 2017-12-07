import { NgModule } 				from '@angular/core';
/* Components */
import { StepZeroComponent } 		from './step-zero.component';
/* Modules */
import { CommonModule }                 from '@angular/common';
import { FormsModule } 				from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
  ],
  declarations: [StepZeroComponent],
  exports: [StepZeroComponent],
})
export class StepZeroModule {}
