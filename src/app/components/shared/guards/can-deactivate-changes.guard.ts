import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';


@Injectable()
export class CanDeactivateChangesGuard implements CanDeactivate<any> {
  private alertify = require('../../../assets/theme/assets/vendor/alertify-js/alertify.js');

  constructor() {
    this.alertify.theme('bootstrap-shootq');
    this.alertify.okBtn('OK');
  }

  canDeactivate(target: any) {
    return Observable.create((observer: Observer<boolean>) => {
      if (target.hasChanges()) {
        this.alertify.confirm('Are you sure you want to leave this page? All unsaved changes will be lost.',
          function () {
            observer.next(true);
            observer.complete();
          }, function () {
            observer.next(false);
            observer.complete();
          });
      } else {
        observer.next(true);
        observer.complete();
      }
    });
  }
}
