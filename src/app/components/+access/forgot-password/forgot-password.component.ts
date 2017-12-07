import { Component, OnInit, ViewChild, AfterViewInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AccessService } from '../../../services/access';
import { GeneralFunctionsService } from '../../../services/general-functions';
import { FlashMessageService } from '../../../services/flash-message';
import { ActivatedRoute } from '@angular/router';
declare let process: (any);

@Component({
  selector: 'forgot-password',
  templateUrl: 'forgot-password.component.html',
  styleUrls: ['forgot-password.component.scss'],
  providers: [AccessService, GeneralFunctionsService, FlashMessageService]
})
export class ForgotPasswordComponent implements OnInit {
  @ViewChild('inputEmail') inputEmail: any;
  public isLoading: boolean = false;
  public recoverSent: boolean = false;
  public key: string | null = null;
  public showFormErrors: boolean = false;
  private forgotPasswordForm: FormGroup;

  constructor(
    private accessService: AccessService,
    private generalFunctions: GeneralFunctionsService,
    private flash: FlashMessageService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.buildForm();
    this.route.params.subscribe((params) => {
      if (params['key']) {
        this.key = params['key'];
      }
    });
  }

  /**
   * ngAfterViewInit hook
   */
  ngAfterViewInit() {
    if (this.inputEmail !== undefined) {
      this.inputEmail.nativeElement.focus();
    }
  }

  /**
   * [navigateTo description]
   * @param {stirng} location [description]
   */
  public navigateTo(location: string) {
    this.generalFunctions.navigateTo(location);
  }

  /**
   * Function to perform Recover Password.
   */
  public doResetPassword(): void {
    this.showFormErrors = true;
    if (this.forgotPasswordForm.valid) {
      this.recoverSent = true;
      this.isLoading = false;
      // MAKE API OAUTH POST REQUEST
      this.accessService.doResetPassword(this.forgotPasswordForm.value.email)
        .subscribe(
          data => {
            this.flash.success('Password recovery link was successfully sent.');
          },
          err => {
            console.error(err);
            this.flash.error('Forgot password failed, please try again.');
            this.isLoading = false;
          },
        );
      }
    }
  buildForm(): void {
    this.forgotPasswordForm = this.formBuilder.group({
      'email': [
        '',
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.maxLength(254),
        ]),
        Validators.composeAsync([
          this.asyncValidateEmailExists.bind(this)
        ])
      ],
    });
  }
  public asyncValidateEmailExists(control) {
    return new Promise(resolve => {
      if (!control.value)
        resolve(null);

      this.accessService.testUniqueEmail(control.value)
        .subscribe(
          response => {
            response = JSON.parse(response);
            if (response.exists) {
              resolve(null);
            } else {
              resolve({[`emailExistsInvalid`]: true});
            }
          },
          error => {
            resolve(null);
          }
        );
    });
  }

}
