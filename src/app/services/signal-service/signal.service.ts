import { Injectable } from '@angular/core';
import { Observable, Observer, Subject } from 'rxjs/Rx';

export interface SignalMessage {
  group: string;
  type: string;
  instance?: any;
}

@Injectable()
export class SignalService {

  stream: Subject<SignalMessage> = new Subject<SignalMessage>();

  constructor() {
  }

  send(message: SignalMessage): void {
    return this.stream.next(message);
  }

}
