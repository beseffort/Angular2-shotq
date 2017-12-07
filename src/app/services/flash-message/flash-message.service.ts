import { Injectable } from '@angular/core';
declare let require: (any);

@Injectable()
export class FlashMessageService {
  // require toastr libary to display flash messages
  toastr = require('../../assets/theme/assets/vendor/toastr/toastr.js');


  // default options
  options = {
    'closeButton': true,
    'debug': false,
    'newestOnTop': false,
    'progressBar': false,
    'positionClass': 'toast-bottom-left',
    'preventDuplicates': true,
    'onclick': null,
    'showDuration': '3000',
    'hideDuration': '1000',
    'timeOut': '5000',
    'extendedTimeOut': '1000',
    'showEasing': 'swing',
    'hideEasing': 'linear',
    'toastClass': 'toast animated'
  };

  /**
   *  Call to toastr succes method
   * @param {string}
   * @param {string}
   * @param {[type]}
   */
  success(message: string, title?: string, options?) {
    if (options === undefined) {
      this.toastr.success(message, title, this.options);
    } else {
      this.toastr.success(message, title, options);
    }
  }

  /**
   *  Call to toastr succes method
   * @param {string}
   * @param {string}
   * @param {[type]}
   */
  warningremove(message: string, title?: string, options?) {
    if (options === undefined) {
      this.toastr.warning(message, title, this.options);
    } else {
      this.toastr.warning(message, title, options);
    }
  }

  /**
   *  Call to toastr succes method
   * @param {string}
   * @param {string}
   * @param {[type]}
   */
  error(message: string, title?: string, options?) {
    if (options === undefined) {
      this.toastr.error(message, title, this.options);
    } else {
      this.toastr.error(message, title, options);
    }
  }

  /**
   * Immediately remove current toasts without using animation
   */
  remove() {
    this.toastr.remove();
  }

  /**
   * Remove current toasts using animation
   */
  clear() {
    this.toastr.clear();
  }
}
