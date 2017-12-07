import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { RouterModule }       from '@angular/router';
import { FormsModule }        from '@angular/forms';
import { DropdownComponent }  from './dropdown.component';
import { DropdownModule }     from 'ngx-dropdown';
import { MdCheckboxModule }   from '@angular2-material/checkbox';
import { PipesModule }        from '../../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DropdownModule,
    MdCheckboxModule,
    PipesModule
  ],
  declarations: [ DropdownComponent ],
  exports: [ DropdownComponent ],
})
export class CustomDropdownModule {}
