import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'alert',
  templateUrl: 'alert.component.html',
  styleUrls: ['alert.component.scss']
})
export class AlertComponent {


  isAlert: boolean = false;
  isConfirm: boolean = false;
  isPrompt: boolean = false;

  alertify = require('../../../assets/theme/assets/vendor/alertify-js/alertify.js');

  @Input()
  id: string;

  @Input()
  name: string;

  // message to display
  @Input('content')
  contentMessage: string;

  // type of alert: alert, confirm or prompt
  _type: string;

  @Input()
  set type(t: string) {

    switch (t) {
      case 'alert':
        this._type = 'alert';
        this.isAlert = true;
        break;
      case 'confirm':
        this._type = 'confirm';
        this.isConfirm = true;
        break;
      case 'prompt':
        this._type = 'prompt';
        this.isPrompt = true;
        break;
      default:
        break;
    }
  }

  get type() {
    return this._type;
  }

  // btn class
  @Input()
  btnClass: string = 'btn btn-default';

  // prompt default value
  @Input('default-value')
  promptDefaultValue: string;

  // disabled
  @Input()
  disabled: boolean = false;

  @Output()
  alertOk = new EventEmitter();

  @Output()
  confirmOk = new EventEmitter();

  @Output()
  confirmCancel = new EventEmitter();

  @Output()
  promptOk = new EventEmitter();

  @Output()
  promptCancel = new EventEmitter();


  constructor() {
    this.initAlertify();
  }

  /*
   call the porper alertify method based on the type of alert
   */
  private onClick() {
    if (this.isAlert) {
      this.alert();
    } else if (this.isConfirm) {
      this.confirm();
    } else if (this.isPrompt) {
      this.prompt();
    }
  }

  /**
   * Call the alert method from alertify library
   */
  private alert() {
    this.alertify.alert(this.contentMessage);
    this.alertOk.emit({});
  }

  /**
   * Call the success method from alertify library
   * execute the component's callbacks if they exists
   */
  private confirm() {
    let $this = this;
    this.alertify.confirm(this.contentMessage,
      function () {
        $this.confirmOk.emit({});
      },
      function () {
        $this.confirmCancel.emit({});
      });
  }

  /**
   * Call the prompt method from alertify library
   * execute the component's callbacks if they exists
   */
  private prompt() {
    let $this = this;
    this.alertify
      .defaultValue(this.promptDefaultValue)
      .prompt(this.contentMessage,
        function (val, ev) {
          $this.promptOk.emit({val: val, ev: ev});
          // if($this.successCallback !== undefined) {
          //   $this.successCallback(val, ev);
          // }
        },
        function (ev) {
          $this.promptCancel.emit(ev);
          // if($this.cancelCallback !== undefined) {
          //   $this.cancelCallback(ev);
          // }
        });
  }

  // Init alertify with Remark theme options
  private initAlertify() {
    // let defaults = $.components.getDefaults("alertify");
    this.alertify.theme('bootstrap-shootq');
    this.alertify.okBtn('OK');
  }
}
