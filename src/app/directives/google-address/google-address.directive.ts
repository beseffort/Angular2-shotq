import { Directive, ElementRef, EventEmitter, Output } from '@angular/core';
import { NgModel, NgControl } from '@angular/forms';

declare let google: any;

@Directive({
  selector: '[googleplace]',
  providers: [NgModel],
  host: {
    '(input)' : 'onInputChange()'
  }
})
export class GoogleAddressDirective {
  @Output() setAddress: EventEmitter<any> = new EventEmitter();
  modelValue: any;
  autocomplete: any;
  private _el: HTMLElement;
  constructor(el: ElementRef, private model: NgModel) {
    this._el = el.nativeElement;
    this.modelValue = this.model;
    let input = this._el;
    this.autocomplete = new google.maps.places.Autocomplete(input, {});
    google.maps.event.addListener(this.autocomplete, 'place_changed', () => {
      let place = this.autocomplete.getPlace();
      this.invokeEvent(place);
    });
  }
  invokeEvent(place: Object) {
    this.setAddress.emit(place);
  }
  onInputChange() {
  }
}
