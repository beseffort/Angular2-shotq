import { NgModule } from '@angular/core';
import { MaterialTabComponent } from './tab.component';
import { MdTabsModule } from '@angular2-material/tabs';
import { CommonModule }                    from '@angular/common';

@NgModule({
  imports: [
    MdTabsModule,
    CommonModule
  ],
  declarations: [
    MaterialTabComponent
  ],
  exports: [
    MaterialTabComponent
  ]
})
export class MaterialTabModule {}
