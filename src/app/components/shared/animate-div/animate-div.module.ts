import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AnimateDivComponent } from './animate-div.component';
import { FormsModule } from '@angular/forms';
import { CommonModule }                    from '@angular/common';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [ AnimateDivComponent ],
  exports: [ AnimateDivComponent ]
})
export class AnimateDivModule {}
