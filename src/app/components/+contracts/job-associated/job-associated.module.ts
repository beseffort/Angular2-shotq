import { NgModule } 				from '@angular/core';
import { JobAssociatedComponent }   from './job-associated.component';
import { MdRadioModule } 			from '@angular2-material/radio';
import { FormsModule } 				from '@angular/forms';
import { CommonModule }                    from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    MdRadioModule,
    FormsModule
  ],
  declarations: [JobAssociatedComponent],
  exports: [JobAssociatedComponent]
})
export class JobAssociatedModule {}
