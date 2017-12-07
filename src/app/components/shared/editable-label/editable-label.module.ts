import { NgModule } 				from '@angular/core';
/* Components */
import { EditableLabelComponent } 	from './editable-label.component';
/* Modules */
import { FormsModule } 				from '@angular/forms';
import { PipesModule } 				from '../../../pipes/pipes.module';
import { CommonModule }                    from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PipesModule
  ],
  declarations: [EditableLabelComponent],
  exports: [EditableLabelComponent]
})
export class EditableLabelModule {}
