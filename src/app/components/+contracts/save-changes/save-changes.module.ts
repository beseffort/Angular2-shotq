import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SaveChangesComponent } from './save-changes.component';
import { MdRadioModule } from '@angular2-material/radio';
import { FormsModule } from '@angular/forms';
import { CommonModule }                    from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    MdRadioModule,
    FormsModule
  ],
  declarations: [SaveChangesComponent],
  exports: [SaveChangesComponent]
})
export class SaveChangesModule {}
