import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'cpager',
  templateUrl: 'cpager.component.html'
})
export class CpagerComponent {

  perPageOptions = [5, 10, 50, 100, 150];
  perPage = this.perPageOptions[0];
  paginationPerPage = this.perPage;

  @Input() totalItems: Number;
  @Input() currentPage: Number;
  // Fires every time currentPage or perPage values are changed
  @Output() ngChange: EventEmitter<Object> = new EventEmitter<Object>();

  onPerPageChanged(value) {
    // Set perPage to selected value
    this.perPage = value;
    if (this.currentPage === 1) {
      // Emit event so parent component knows about changes
       setTimeout(() => this.ngChange.emit({page: this.currentPage, perPage: this.perPage}));
    } else {
      // Reset to first page ones perPage was changed to prevent situation like current page is 50 of 10
      // Changing currentPage will provoke onPageChanged so no need to emit it here
      this.currentPage = 1;
    }

    // We use separate paginationPerPage variable to avoid "Expression has changed after it was checked" error when both currentPage and perPage
    // changes at the same time
    setTimeout(() => this.paginationPerPage = this.perPage);
  }

  onPageChanged(value) {
     setTimeout(() => this.ngChange.emit({page: value.page, perPage: this.perPage}));
  }
}
