import { NgModule } from '@angular/core';
import { FBComponent } from './floating-button.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, FormsModule, RouterModule],
  declarations: [
    FBComponent
  ],
  exports: [
    FBComponent
  ]
})
export class FBModule {}
