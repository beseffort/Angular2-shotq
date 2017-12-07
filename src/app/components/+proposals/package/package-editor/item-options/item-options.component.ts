import * as _ from 'lodash';
import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';

import { ItemOptionGroup } from '../../../../../models/item-option-group';
import { ItemOption } from '../../../../../models/item-option';


@Component({
  selector: 'item-options',
  templateUrl: './item-options.component.html'
})
export class ItemOptionsComponent implements OnInit {
  @Input() groups: ItemOptionGroup[];
  @Input() optionsFieldName: string = 'options';
  @Output() onChange: EventEmitter<any> = new EventEmitter<any>();
  groupsOptions: any;

  @HostListener('click', ['$event']) onMouseClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  ngOnInit() {
    this.groupsOptions = this.groups.map((g) => {
      let options = g[this.optionsFieldName].map((o: ItemOption) => {
        let option = {value: o.id, label: o.name};
        if (o.extra_price && parseFloat(o.extra_price) > 0) {
          option.label += ` (+$${o.extra_price})`;
        }
        return option;
      });
      if (!g.required) {
        options.unshift({value: null, label: 'Not selected'});
      }
      return options;
    });
  }

  selectGroupOption(groupIndex: number) {
    setTimeout(() => {
      let group = this.groups[groupIndex];
      let selected = group.selected ? Number(group.selected) : group.selected;
      let selected_data = group[this.optionsFieldName].find(o => o.id === selected);
      if (!_.isEqual(group.selected_data, selected_data)) {
        group.selected_data = selected_data;
        this.onChange.emit(group);
      }
    });
  }

}
