import { Directive, Input, OnInit, OnDestroy } from '@angular/core';
import { DragulaService } from 'ng2-dragula/ng2-dragula';


@Directive({ selector: '[dragulaScroller]' })
export class DragulaScrollerDirective implements OnInit, OnDestroy {
  @Input()
  dragulaScroller: string;
  @Input()
  dragulaScrollMargin: number = 20;
  @Input()
  dragulaScrollSpeed: number = 5;
  @Input()
  dragulaScrollContainers: Array<any> = [window];

  scroll: any;

  constructor(
    private dragulaService: DragulaService) {
  }

  ngOnInit() {
    let bag = this.dragulaService.find(this.dragulaScroller);
    let drake = bag.drake;
    let autoScroll = require('dom-autoscroller');
    this.scroll = autoScroll(this.dragulaScrollContainers, {
      margin: this.dragulaScrollMargin,
      maxSpeed: this.dragulaScrollSpeed,
      scrollWhenOutside: true,
      autoScroll: function(){
        // Only scroll when the pointer is down, and there is a child being dragged.
        return this.down && bag.drake.dragging;
      }
    });
  }

  ngOnDestroy() {
    this.scroll.destroy();
  }
}
