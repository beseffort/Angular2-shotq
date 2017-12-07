import { Component, ViewChild } from '@angular/core';
import { AccessService } from '../../../services/access';
import { FlashMessageService } from '../../../services/flash-message';
import { GeneralFunctionsService } from '../../../services/general-functions';
declare let process: (any);

@Component({
  selector: 'log-in',
  templateUrl: 'log-in.component.html',
  styleUrls: ['log-in.component.scss'],
  providers: [GeneralFunctionsService, FlashMessageService]
})
export class LogInComponent {
  @ViewChild('inputUsername') inputUsername: any;
  public username: string;
  public password: string;
  public isLoading: boolean = false;
  public hideLoginScreen: boolean = false;

  constructor(private accessService: AccessService,
              private generalFunctions: GeneralFunctionsService,
              private flash: FlashMessageService) {
  }

  ngAfterViewInit() {
    if (this.inputUsername !== undefined) {
      this.inputUsername.nativeElement.focus();
    }
  }

  public navigateTo(location: string) {
    this.generalFunctions.navigateTo(location);
  }

  //noinspection JSUnusedGlobalSymbols
  public doLogin() {
    if (this.username !== undefined
      && this.username !== ''
      && this.password !== undefined
      && this.password !== '') {
      this.isLoading = true;
      this.accessService.login(this.username, this.password)
        .finally(() => this.isLoading = false)
        .subscribe(() => {
            this.hideLoginScreen = true;
            /* Check for refererUrl and redirect after login */
            let refererUrl = sessionStorage.getItem('refererUrl');
            if (refererUrl !== undefined && refererUrl !== null) {
              setTimeout(() => {
                this.navigateTo(refererUrl);
                sessionStorage.removeItem('refererUrl');
                refererUrl = undefined;
              });
            } else {
              setTimeout(() => {
                this.navigateTo('/contacts');
              });
            }
          },
          err => {
            console.error(err);
            this.flash.error('Login failed. Please try again.');
            this.password = '';
          });
    } else {
      this.flash.error('We didn\'t recognize the username or password you entered. Please try again.');
      this.isLoading = false;
      this.password = '';
    }
  }
}
