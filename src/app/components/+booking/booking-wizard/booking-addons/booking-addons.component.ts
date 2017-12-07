import { Component, Input } from '@angular/core';
import { Package } from '../../../../models/package';
import { Item } from '../../../../models/item';
import { ItemService } from '../../../../services/product/item/item.service';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import { Subscription, Subject } from 'rxjs';


@Component({
  selector: 'booking-addons',
  templateUrl: './booking-addons.component.html',
  styleUrls: ['./booking-addons.component.scss'],
})
export class BookingAddonsComponent {
  @Input() package: Package;

  currentAddon: Item;
  formMargin: string = '';
  debouncedItemSave = new Subject<any>();
  debouncedItemSaveSub$: Subscription;

  constructor(private itemService: ItemService,
              private flashService: FlashMessageService) {

    this.debouncedItemSaveSub$ = this.debouncedItemSave
      .debounceTime(300)
      .subscribe(this.saveItem.bind(this));
  }

  ngOnChanges() {
    if (this.package.addons.length && !this.currentAddon) {
      const first_addon = this.package.addons[0];
      this.saveItem(first_addon);
      this.selectAddon(first_addon, 0);
    }
  }

  ngOnDestroy() {
    this.debouncedItemSaveSub$.unsubscribe();
  }

  selectAddon(addon, index) {
    this.currentAddon = addon;
    this.formMargin = `${index * 108}px`;
  }

  checkAddon(addon, event) {
    addon.approved = !addon.approved;
    this.saveItem(addon);
  }

  saveItem(_item: Item) {
    _item.quantity = _item.quantity || 1;
    this.itemService.save(_item)
      .subscribe((item: Item) => {
        // Object.assign(_item, item);
        // this.flashService.success(`Addon ${item.name} saved successfully`);

      });

  }
}
