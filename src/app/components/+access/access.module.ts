import { NgModule }                          from '@angular/core';
/* Components */
import { LogInComponent }                    from './log-in/log-in.component';
import { SignUpComponent }                   from './sign-up/sign-up.component';
import { ForgotPasswordComponent }           from './forgot-password/forgot-password.component';
import { ChangePasswordComponent }           from './change-password/change-password.component';
/* Modules */
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'ngx-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared';
import { TooltipModule } from 'ngx-bootstrap';
import AsyncValidator from './sign-up/validation.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TooltipModule.forRoot()
  ],
  declarations: [
    LogInComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    ChangePasswordComponent
  ],
  exports: [
    LogInComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    ChangePasswordComponent
  ],
})
export class AccessModule {}
