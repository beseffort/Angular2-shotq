import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Item } from '../../../../../models/item';
import { ItemOptionGroup } from '../../../../../models/item-option-group';
import { ItemOptionGroupService } from '../../../../../services/product/item-option-group/item-option-group.service';

@Component({
  selector: 'app-booking-addon-form',
  templateUrl: './booking-addon-form.component.html',
  styleUrls: [
    './booking-addon-form.component.scss'
  ]
})
export class BookingAddonFormComponent implements OnInit {
  @Input() addon: Item = {quantity: 5};
  @Output() onChange = new EventEmitter<any>();

  form: FormGroup;
  total: number = 0;

  constructor(private formBuilder: FormBuilder,
              private optionGroupService: ItemOptionGroupService) {
    this.buildForm();
  }

  ngOnInit() {
  }

  ngOnChanges(changes) {
  }

  buildForm() {
    this.form = this.formBuilder.group({
      quantity: [0, Validators.compose([])],
    });

  }

  updateTotal() {
    let baseAddonPrice = parseInt(this.addon.price, 10);
    let optionsPrice = this.addon.option_groups
      .filter(item => !!item.selected_data)
      .reduce((sum, val) => sum + parseInt(val.selected_data.extra_price, 0), 0);
    this.total = (baseAddonPrice + optionsPrice);

    this.addon.total_price = this.total;
  }

  saveOptionGroup(optionGroup: ItemOptionGroup) {
    // debounce?
    this.optionGroupService.save(optionGroup)
      .subscribe(res => {
      });
  }

  onOptionSelected(optionGroup, value) {
    optionGroup.selected_data = value;
    this.updateTotal();
    this.saveOptionGroup(optionGroup);
    this.onChange.emit();
  }


}
