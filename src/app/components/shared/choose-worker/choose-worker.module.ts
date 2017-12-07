import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ChooseWorkerComponent }            from './choose-worker.component';
import { FormsModule }                      from '@angular/forms';
import { InfiniteScrollModule }             from 'angular2-infinite-scroll';
import { FormFieldModule } 					        from '../form-field';
import { TooltipModule } 					          from 'ngx-bootstrap';
import { CommonModule }                    from '@angular/common';


@NgModule({
  imports: [CommonModule, FormsModule, InfiniteScrollModule, FormFieldModule, TooltipModule],
  declarations: [ChooseWorkerComponent],
  exports: [ChooseWorkerComponent],
  entryComponents: [
    ChooseWorkerComponent
  ]
})
export class ChooseWorkerModule {}
