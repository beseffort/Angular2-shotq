import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
 selector: 'material-tab',
 templateUrl: './tab.component.html',
 styleUrls : ['./tab.component.scss']
})
export class MaterialTabComponent implements OnInit {
 @Input() tabs: Array<any>;
 @Output() onTabChange: EventEmitter<Number> = new EventEmitter<Number>();

 index: Number;

 ngOnInit() {
  this.index 	= this.index || 0;
  this.tabs	= this.tabs || [];
 }
 /**
  * Call to function passed as parameter when selected tab changes
  */
 private emitTabChange() {
  this.onTabChange.emit(this.index);
 }

}
