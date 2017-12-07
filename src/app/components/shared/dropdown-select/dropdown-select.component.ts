import {
  Component, forwardRef, ElementRef, Input, ViewChild, Renderer, Output, EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { isUndefined } from 'util';
import * as _ from 'lodash';

@Component({
  selector: 'app-dropdown-select',
  templateUrl: './dropdown-select.component.html',
  styleUrls: ['./dropdown-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownSelectComponent),
      multi: true,
    }]
})
export class DropdownSelectComponent implements ControlValueAccessor {
  @Input() options: any[];
  @Input('value') _value = false;
  @Input() valueKey = 'value';
  @Input() labelKey = 'label';
  @Input() descriptionKey = 'description';
  @Input() archivedKey = 'archived';
  @Input() readOnly = false;
  @Input() enableSearch = false;
  @Input() disabled: boolean = false;
  @Input() readOnlyOption = null;
  @Input() allowNull = false;
  @Input() placeholder = '';
  @Input() selectFirstAsDefault = true;
  @Input() customActions = [];
  @Input() maxHeight: number;
  @Output() optionSelected = new EventEmitter<any>();
  @ViewChild('dropdownMenu') dropdownMenu: ElementRef;
  @ViewChild('searchBox') searchBox: ElementRef;

  currentOption: any;

  selected: any;
  query: string = '';
  currentLabel: string = '';
  initOptions: any[];
  isOpen: boolean = false;

  onChange: any = () => {  };
  onTouched: any = () => {  };

  constructor(private el: ElementRef, private _renderer: Renderer) {
  }

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
    if (this.options)
      this.currentOption = this.options.find(item => item.value === val);
  }

  ngOnInit() {
    if (this.enableSearch)
      this.initOptions = this.options;
    setTimeout(() => {
      if (this.readOnly && this.readOnlyOption) {
        this.currentOption = this.readOnlyOption;
      } else {
        this.selectOptionByValue(this.value);
      }
    }, 150);
  }

  ngOnDestroy() {
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (this.isOpen && !this.enableSearch) {
      setTimeout(() => {
        this.dropdownMenu.nativeElement.focus();
      });
    }
  }

  onDropdownBlur() {
    window.setTimeout(() => {
        if (this.isOpen) {
          this.toggleDropdown();
        }
      }, 150
    );
  }

  showDropdown() {
    this.isOpen = true;
    if (this.enableSearch)
      this.query = '';
      this.options = this.initOptions;
  }

  enterKeyDown(event) {
    if (event.keyCode === 13) {
      this.selectOption(_.first(this.options), true);
      this.searchBox.nativeElement.blur();
    }
  }

  hideDropdown() {
    setTimeout(() => {
      this.isOpen = false;
      if (!this.enableSearch)
        return;
      if (this.currentOption) {
        this.query = this.currentOption[this.labelKey];
      } else {
        this.selectOption(_.first(this.options), true);
      }
      this.currentLabel = this.query;
    }, 150);
  }

  onQueryChange(query) {
    if (!this.enableSearch)
      return;

    let q = query.toLowerCase();
    this.options = q ? _.filter(this.initOptions, option => {
      let label = option[this.labelKey].toLowerCase();
      return label.indexOf(q) > -1;
    }) : this.initOptions;

    let firstResult = _.find([this.currentOption, _.first(this.options)], (o) => (o ? o[this.labelKey] : '').toLowerCase().startsWith(q));
    let firstResultLabel = firstResult ? firstResult[this.labelKey] : '';

    if (firstResultLabel.toLowerCase().startsWith(q)) {
      this.currentLabel = firstResultLabel;
      this.query = this.currentLabel.slice(0, query.length);
    } else {
      this.currentLabel = '';
    }
  }


  selectOption(option, markTouched: boolean = false) {
    this.isOpen = false;
    if (!isUndefined(option) && this.value !== option.value) {
      setTimeout(() => {
        this.value = option.value;
        if (this.enableSearch)
          this.query = option[this.labelKey];
          this.currentLabel = this.query;
      });
      if (markTouched) {
        this.onTouched();
      }
      this.onChange(option.value);
      this.optionSelected.emit(option.option);
    }
  }

  writeValue(value: any) {
    this.selectOptionByValue(value);
  }

  selectOptionByValue(value) {
    if (!this.options)
      return;

    let currentOption = this.options.find(item => item.value === value);

    if (!currentOption && this.selectFirstAsDefault)
      currentOption = this.options[0];

    if (currentOption)
      this.selectOption(currentOption);
  }

  ngOnChanges(changes) {
    this.initOptions = this.options;
    if (this.options && changes.options) {
      this.options = changes.options.currentValue.map(this.transformOption.bind(this));
      if (this.allowNull) {
        this.options.unshift({
          value: null,
          label: this.placeholder || 'Select option'
        });
      }
      this.initOptions = this.options;
      this.selectOptionByValue(this.value);
    }
  }

  transformOption(option: any) {
    return {
      value: option[this.valueKey],
      label: option[this.labelKey],
      description: option[this.descriptionKey],
      archived: option[this.archivedKey],
      option: option,
    };
  }

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  private propagateChange = (_: any) => { };
}
