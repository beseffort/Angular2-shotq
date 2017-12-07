import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DropdownModule }                   from 'ngx-dropdown';
import { CommonModule }                    from '@angular/common';

import { MdCheckboxModule }                 from '@angular2-material/checkbox';
import { PipesModule }              from '../../../pipes/pipes.module';
import { DropdownSelectComponent } from './dropdown-select.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DropdownModule,
    MdCheckboxModule,
    PipesModule
  ],
  declarations: [DropdownSelectComponent],
  exports: [DropdownSelectComponent],
})
export class DropdownSelectModule {
}
