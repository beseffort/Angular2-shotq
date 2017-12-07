import { Component, Input, Output, EventEmitter, ViewEncapsulation, ViewChild, SimpleChanges } from '@angular/core';

import { PaginationComponent } from 'ngx-bootstrap';

@Component({
  selector: 'paginate',
  templateUrl: 'paginate.component.html',
  styleUrls : ['./paginate.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PaginateComponent {

  @Input() perPageOptions: Array<Number> = [5, 10, 50, 100, 150];
  @Input() newDesign: boolean = false;
  @Input() customClass: string = '';
  @Input() totalItems: number;
  @Input() currentPage: number;
  @Input() perPage: number = 0;
  @Input() showPageSize: boolean = true;
  @Input() maxSize: number = 5;
  // Fires every time currentPage or perPage values are changed
  @Output() ngChange: EventEmitter<Object> = new EventEmitter<Object>();
  @ViewChild('paginator') paginator: PaginationComponent;

  private paginationPerPage;

  ngOnInit() {
    this.paginationPerPage = this.perPage;
  }

  ngOnChanges(changes: SimpleChanges) {
  for (let propName in changes) {
    if (propName === 'maxSize' && this.paginator && this.paginator !== undefined) {
      this.paginator.maxSize = changes[propName].currentValue;
      this.paginator.writeValue(this.currentPage);
    }
  }
}

  private onPerPageChanged(value) {
    // Set perPage to selected value
    if (value === 'all') {
      // 0 means that show all, is used to hide the page number select when all is selected
      this.perPage = 0;
    } else {
      this.perPage = value;
    }
    if (this.currentPage !== 1) {
          this.currentPage = 1;
    }
    this.ngChange.emit({page: this.currentPage, perPage: this.perPage});

    // We use separate paginationPerPage variable to avoid "Expression has changed after it was checked" error when both currentPage and perPage
    // changes at the same time
    setTimeout(() => this.paginationPerPage = this.perPage);
  }

  private onPageChanged(value) {
    this.currentPage = value.page;
    this.ngChange.emit({page: value.page, perPage: this.perPage});
  }

  private selectPagineSize($event, p) {
    this.onPerPageChanged(p);
  }
}
