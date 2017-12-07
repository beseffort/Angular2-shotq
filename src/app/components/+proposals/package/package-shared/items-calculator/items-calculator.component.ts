import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'package-items-calculator',
  templateUrl: './items-calculator.component.html',
  styleUrls: [
    './items-calculator.component.scss'
  ]
})
export class PackageItemsCalculator {
  @Input() cogs_total: number = 0;
  @Input() total: number = 0;
  @Input() profit: number = 0;
  @Input() shipping_cost: number = 0;
  @Output() totalChanged = new EventEmitter<number>();
  @ViewChild('totalInputElm') totalInputElm;
  totalInput = new FormControl();
  postonedValue: number;

  constructor() {
    this.totalInput.valueChanges
      .distinctUntilChanged()
      .filter(value => value !== this.total)
      .debounceTime(300)
      .subscribe(value => {
        this.totalChanged.emit(value);
      });
  }

  ngOnChanges(changes) {
    let focused = jQuery(this.totalInputElm.nativeElement).is(':focus');
    if (changes.total && changes.total.currentValue !== this.totalInput.value) {
      if (!focused) {
        this.totalInput.patchValue(changes.total.currentValue);
      } else {
        this.postonedValue = changes.total.currentValue;
      }
    }
  }

  onTotalInputBlur() {
    if (!this.totalInput.value) {
      this.totalInput.patchValue(this.postonedValue);
    }
  }
}
