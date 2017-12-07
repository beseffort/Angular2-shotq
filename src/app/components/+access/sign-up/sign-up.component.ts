import { Component, OnInit, ViewChild, AfterViewInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AccessService } from '../../../services/access';
import { GeneralFunctionsService } from '../../../services/general-functions';
import { FlashMessageService } from '../../../services/flash-message';
declare let process: (any);
import * as _ from 'lodash';

@Component({
  selector: 'sign-up',
  templateUrl: 'sign-up.component.html',
  styleUrls: ['sign-up.component.scss'],
  providers: [AccessService, GeneralFunctionsService, FlashMessageService]
})
export class SignUpComponent implements OnInit {
  @ViewChild('inputEmail') inputEmail: any;
  public isLoading: boolean = false;
  public showFormErrors: boolean = false;
  private signUpForm: FormGroup;

  constructor(
    private accessService: AccessService,
    private generalFunctions: GeneralFunctionsService,
    private flash: FlashMessageService,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit() {
    this.buildForm();
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
   * Function to perform sign-up.
   */
  public doSignUp() {
    this.showFormErrors = true;
    if (this.signUpForm.valid) {
      this.isLoading = true;
      let signUpData = {
        'first_name': this.signUpForm.value.first_name,
        'last_name': this.signUpForm.value.last_name,
        'email': this.signUpForm.value.email,
        'username': this.signUpForm.value.username,
        'password': this.signUpForm.value.password,
        'grant_type': process.env.APICONFIG.grant_type,
        'client_id': process.env.APICONFIG.client_id,
        'client_secret': process.env.APICONFIG.client_secret,
      };
      // MAKE API OAUTH POST REQUEST
      this.accessService.doOAuthSignUp(signUpData)
        .subscribe(
          response => {
            let postData = this.generalFunctions.getSearchParams(signUpData);
            this.accessService.doOAuthLogin(postData.toString())
              .subscribe(_response => {
                sessionStorage.setItem('OAuthInfo', JSON.stringify(_response));
                this.accessService.setCredentials();

                /* Get and set account id */
                this.accessService.getLoggedAccountId()
                  .subscribe(data => {
                      sessionStorage.setItem('accountInfo', JSON.stringify(data));
                      this.accessService.setCredentials();
                      this.navigateTo('/contacts');
                    },
                    err => {
                      console.error(err);
                      this.isLoading = false;
                    },
                );

                this.accessService.getUserProfileInfo().subscribe(user => {
                  sessionStorage.setItem('currentUser', JSON.stringify(user));
                });

              });
          },
          err => {
            console.error(err);
            this.flash.error('Sign Up failed, please try again.');
            this.isLoading = false;
          },
        );
    }
  }
  public asyncValidateUnique(fieldName, control) {
    let uniqueInvalid = {[`${fieldName}UniqueInvalid`]: true};
    return new Promise(resolve => {
      if (!control.value)
        resolve(null);

      this.accessService[`testUnique${_.capitalize(fieldName)}`](control.value)
        .subscribe(
          response => {
            response = JSON.parse(response);
            if (response.exists) {
              resolve(uniqueInvalid);
            } else {
              resolve(null);
            }
          },
          error => {
            resolve(uniqueInvalid);
          }
        );
    });
  }
  buildForm(): void {
    this.signUpForm = this.formBuilder.group({
      'first_name': [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(30),
        ]),
      ],
      'last_name': [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(30),
        ]),
      ],
      'email': [
        '',
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.maxLength(254),
        ]),
        Validators.composeAsync([
          this.asyncValidateUnique.bind(this, 'email')
        ])
      ],
      'username': [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(150),
          Validators.pattern(/^[\w.@+-]+$/),
        ]),
        Validators.composeAsync([
          this.asyncValidateUnique.bind(this, 'username')
        ])
      ],
      'password': [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(128),
        ])
      ],
    });
  }
}
