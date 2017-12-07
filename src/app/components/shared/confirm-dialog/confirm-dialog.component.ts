import { Component, ViewChild, Output, EventEmitter, Input } from '@angular/core';

import { ModalDirective } from 'ngx-bootstrap';


@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: [
    './confirm-dialog.component.scss'
  ]
})
export class ConfirmDialogComponent {
  @ViewChild('modal') modal: ModalDirective;

  @Input('actionBtnMode') actionMode: string = 'btn_blue';
  @Output('confirmed') confirmed = new EventEmitter();

  private _title: string;
  private _body: string;
  private _action: string;
  private _data: any;

  ngOnInit() {
  }

  get title() {
    return this._title;
  }

  set title(title: string) {
    this._title = title;
  }

  get body() {
    return this._body;
  }

  set body(body: string) {
    this._body = body;
  }

  get action() {
    return this._action;
  }

  set action(action: string) {
    this._action = action;
  }

  get data() {
    return this._data;
  }

  set data(data: any) {
    this._data = data;
  }

  show() {
    this.modal.show();

    jQuery('.modal-backdrop')[0].classList.add('modal-backdrop_grey');
  }

  hide() {
    this.modal.hide();
  }

  confirm() {
    this.hide();
    this.confirmed.emit(this.data);
  }
}
