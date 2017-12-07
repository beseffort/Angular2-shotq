import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterSelectComponent } from './filter-select.component';
import { CommonModule }                    from '@angular/common';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [
    FilterSelectComponent
  ],
  exports: [
    FilterSelectComponent
  ]
})
export class FilterSelectModule {}
