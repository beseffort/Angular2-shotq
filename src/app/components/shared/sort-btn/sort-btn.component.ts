import { Component, Input, Output, EventEmitter } from '@angular/core';
declare let require: (any);

@Component({
  selector: 'sort-btn',
  templateUrl: 'sort-btn.component.html',
  styleUrls: ['sort-btn.component.scss']
})
export class SortBtnComponent {
  public _ = require('../../../../../node_modules/lodash');
  // Ordering for this button
  @Input() orderBy: String;
  // Current globally applied ordering
  @Input() currentOrderBy: String;
  @Output() currentOrderByChange: EventEmitter<String> = new EventEmitter<String>();
  // Current globally applied direction - 'asc' or 'desc'
  @Input() currentOrderDirection: String;
  @Output() currentOrderDirectionChange: EventEmitter<String> = new EventEmitter<String>();
  // On change event handler
  @Output() ngChange: EventEmitter<any> = new EventEmitter<any>();
  @Input() title: String;
  @Input() cssClass: String;
  @Input() iconClass: String; // One of 'amount', 'numeric', 'alpha'

  @Input() newStyles: boolean = false; // Use to keep old styles compatibility
  @Input() upIconClass: String = 'icon-up-arrow';
  @Input() downIconClass: String = 'icon-down-arrow';

  toggleSorting() {
    if (!this.newStyles) {
      this.currentOrderDirection = this.isCurrentlyOrdered() ? this.reverseDirection(this.currentOrderDirection) : 'asc';
    } else {
      this.currentOrderDirection = this.reverseDirection(this.currentOrderDirection);
    }
    this.currentOrderBy = this.orderBy;
    this.currentOrderByChange.emit(this.currentOrderBy);
    this.currentOrderDirectionChange.emit(this.currentOrderDirection);
    this.ngChange.emit({orderBy: this.currentOrderBy, orderDirection: this.currentOrderDirection});
  }

  sortIconClass() {
    if (!this.newStyles) {
      return this.isCurrentlyOrdered() ? this._.compact(['fa-sort', this.iconClass, this.currentOrderDirection]).join('-') : 'fa-sort';
    } else {
      if (this.currentOrderDirection === 'asc') {
        return this.upIconClass;
      } else {
        return this.downIconClass;
      }
    }
  }

  private isCurrentlyOrdered() {
    return this.currentOrderBy === this.orderBy;
  }

  private reverseDirection(direction: String) {
    return direction === 'asc' ? 'desc' : 'asc';
  }
}
