import { Component, ElementRef, EventEmitter, Output, Input, SimpleChanges,
trigger,
  state,
  style,
  transition,
  animate } from '@angular/core';

import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'animate-div',
  animations: [
    trigger('divInOut', [
      state('in', style({
        height: '*',
        'margin-top': '*',
        'padding-top': '*',
        'padding-bottom': '*',
        'opacity': 1
      })),
      state('out', style({
        height: 0,
        opacity: 0,
        'margin-top': 0,
        'padding-top': 0,
        'padding-bottom': 0
      })),
      transition('in => out', animate('350ms ease-out')),
      transition('out => in', animate('350ms ease-out'))
    ])
  ],
  templateUrl: 'animate-div.component.html',
  styleUrls: ['animate-div.component.scss'],
})
export class AnimateDivComponent {
  @Input() class: string = '';
  @Input() action: string = 'show';
  @Output() startAnimation: EventEmitter<any> = new EventEmitter();
  @Output() endAnimation: EventEmitter<any> = new EventEmitter();
  @Output() transitionAnimation: EventEmitter<any> = new EventEmitter();

  private animation: any = 'in';
  private timer;
  private subscriber;

  private ticks = 0;

  ngOnInit() {
    this.actionChange();
    this.timer = Observable.timer(0, 10);
  }

  ngOnChanges(changes: SimpleChanges) {
    for (let propName in changes) {
      if (changes.hasOwnProperty(propName) && (propName === 'action')) {
        this.actionChange();
      }
    }
  }
  /**
   * [actionChange description]
   */
  private actionChange() {
    if (this.action === 'show') {
      this.animation = 'in';
    } else {
      this.animation = 'out';
    }
  }
  /**
   * [animationStarted description]
   * @param {any} e [description]
   */
  private animationStarted(e: any) {
    this.ticks = 0;
    this.startAnimation.emit({event: e, ticks: this.ticks});
    this.subscriber = this.timer.subscribe(t => {
      this.ticks = t;
      this.transitionAnimation.emit({ticks: t});
    });
  }
  /**
   * [animationDone description]
   * @param {any} e [description]
   */
  private animationDone(e: any) {
    this.endAnimation.emit({event: e, ticks: this.ticks});
    if (this.subscriber !== undefined) {
      this.subscriber.unsubscribe();
    }
    this.ticks = 0;
  }

}
