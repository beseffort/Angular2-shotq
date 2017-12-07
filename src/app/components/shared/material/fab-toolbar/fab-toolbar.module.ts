import { NgModule }            from '@angular/core';
import { FABToolbarComponent } from './fab-toolbar.component';
import { FormsModule }         from '@angular/forms';
import { TooltipModule }       from 'ngx-bootstrap';
import { CommonModule }        from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TooltipModule.forRoot()
  ],
  declarations: [
    FABToolbarComponent
  ],
  exports: [
    FABToolbarComponent
  ]
})
export class FABToolbarModule {}
