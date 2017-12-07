import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnChanges, DoCheck, SimpleChanges } from '@angular/core';

declare let require: (any);

@Component({
    selector: 'filter-select',
    templateUrl: './filter-select.component.html',
    styleUrls : ['./filter-select.component.scss']
})
export class FilterSelectComponent {
  @Input() listOptions: Array<any> = [];
  @Input() selectedValues: Array<any> = [];
  @Input() data: Array<any> = [];
  @Input() label: string = '';
  @Input() idBlock: string = '';
  @Input() required: boolean = false;
  input: HTMLInputElement;
  container: HTMLElement;
  public listAdded= [];
  public searchTerm: string = '';
  private errors = null;
  private isOpen: boolean = false;

  ngOnChanges() {
    this.setSeletedValues();
  }

  ngAfterViewInit() {
    this.container = document.getElementById('filterSelect-' + this.idBlock);
    let inputs = this.container.getElementsByTagName('input');
    if (inputs[0]) {
      this.input = inputs[0];
      this.input.addEventListener('focus', () => {
        this.container.classList.add('filterOpen');
      });
      this.input.addEventListener('blur', () => {
        setTimeout(() => {
          this.container.classList.remove('filterOpen');
          this.getErrors();
        }, 150);
      });
    }
  }

  public setSeletedValues() {
    for (let i = 0, len = this.data.length; i < len; i++) {
        let id = this.data[i];
        for (let ib = 0, lenb = this.listOptions.length; ib < lenb; ib++) {
            if (Number(this.listOptions[ib].value) === Number(id)) {
                this.listOptions[ib].selected = true;
                this.listAdded.push(this.listOptions[ib]);
                break;
            }
        }
    }
  }
  /**
   * Function triggered when an option is added on selector
   * @param {any} option [added element]
   */
  public onOptionAdded(index) {
    let label = this.filterListOptions[index].label;
    for (let i = 0, len = this.listOptions.length; i < len; i++) {
        if (this.listOptions[i].label === label) {
            this.listOptions[i].selected = true;
            this.listAdded.push(this.listOptions[i]);
            this.data.push(Number(this.listOptions[i].value));
            break;
        }
    }
    this.getErrors();
  }
  /**
   * Function triggered when an option is removed from selector
   * @param {any} option [removed element]
   */
  public onOptionRemoved(index) {
    let label = this.listAdded[index].label;
    for (let i = 0, len = this.listOptions.length; i < len; i++) {
        if (this.listOptions[i].label === label) {
            this.listOptions[i].selected = false;
            this.listAdded.splice(index, 1);
            this.data.splice(index, 1);
            break;
        }
    }
    this.getErrors();
  }
  /**
   * Set focus on selector when span text is clicked
   */
  focusSelector() {
    this.container = document.getElementById('filterSelect-' + this.idBlock);
    let inputs = this.container.getElementsByTagName('input');
    inputs[0].focus();
  }
  /**
   * Check errors if multiselect is seted as required
   */
  getErrors() {
    if (this.container) {
        if (this.container && this.data.length === 0) {
          this.errors = 'The above field is required. Please choose a ' + this.label;
          this.container.classList.add('has-error');
          return false;
        } else {
          this.errors = null;
          this.container.classList.remove('has-error');
          return true;
        }
    } else {
      console.error('Multiselect container not found');
    }
  }
  get filterListOptions () {
    let filtered = this.listOptions.filter((option) => {
        if (option.selected === false) {
            return option.label.toUpperCase().indexOf(this.searchTerm.toUpperCase(), 0) > -1;
        } else {
            return false;
        }
    });
    return filtered;
  }

}
