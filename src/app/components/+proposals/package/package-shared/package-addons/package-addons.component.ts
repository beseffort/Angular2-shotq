import * as _ from 'lodash';
import {
  Component, Input, Output,
  OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { BaseItem } from '../../../../../models/base-item';


@Component({
  selector: 'package-template-addons',
  templateUrl: './package-addons.component.html'
})
export class PackageTemplateAddonsComponent implements OnChanges {
  @Input() allItems: BaseItem[];
  @Input() contents: number[];
  @Output() contentsChanged: EventEmitter<number[]> = new EventEmitter<number[]>();
  items: BaseItem[] = [];

  constructor(dragulaService: DragulaService) {
    dragulaService.dropModel.subscribe((args) => {
      if (this.contents.length !== this.items.length) {
        this.contentsChanged.emit(this.getContents());
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['contents']) {
      this.items = this.contents.map((i: number) => {
        return _.find(this.allItems, {id: i});
      });
    }
  }

  getContents(): number[] {
    return this.items.map(i => i.id);
  }

  removeProduct(index: number) {
    this.items.splice(index, 1);
    this.contentsChanged.emit(this.getContents());
  }
}
