import { Output, Input, Component, OnChanges, EventEmitter, OnInit } from '@angular/core';

export interface FilterChoice {
  key: string;
  title: string;
  selected?: boolean | undefined;

}

export interface FilterParam {
  key: string;
  title: string;
  choices: FilterChoice[];
}

@Component({
  selector: 'app-filter-panel',
  templateUrl: './filter-panel.component.html',
  styleUrls: ['./filter-panel.component.scss'],

})
export class FilterPanelComponent {
  @Input() filterParams: FilterParam[];
  @Output() filterChanged: EventEmitter<any> = new EventEmitter();

  constructor() {

  }

  ngOnAfterViewInit() {
    this.filterChanged.emit(this.getSelected());
  }


  clearChoices(filter) {
    filter.choices.map((choice) => choice.selected = false);
  }

  toggleChoice(filter, choice) {

    if (choice.key == null) {
      this.clearChoices(filter);
      choice.selected = true;
    } else {
      choice.selected = !choice.selected;
      let anySelected = filter.choices.some(_choice => _choice.key !== null && _choice.selected);
      let allOption = filter.choices.find(_choice => _choice.key == null);
      if (allOption)
        allOption.selected = !anySelected;

    }
    this.filterChanged.emit(this.getSelected());
  }

  getSelected() {
    let result = {};
    this.filterParams
      .map((filter: FilterParam) => {
          let selected = filter.choices
            .filter((choice: FilterChoice) => !!choice.selected && choice.key !== null)
            .map(choice => choice.key);
          if (selected.length > 0) {
            result[filter.key] = selected;
          }
        }
      );
    return result;
  }

}
