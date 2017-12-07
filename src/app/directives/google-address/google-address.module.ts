import { NgModule } from '@angular/core';
import { GoogleAddressDirective } from './google-address.directive';


@NgModule({
  declarations: [ GoogleAddressDirective ],
  exports: [ GoogleAddressDirective ]
})
export class GoogleAddressModule { }
