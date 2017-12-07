import * as _ from 'lodash';
import { } from '@types/googlemaps'; // tslint:disable-line
import {
  Component, OnInit, Input,
  Output, EventEmitter, ElementRef
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Event } from '../../../../../../models/event';
import { BaseAddress, BaseLocation } from '../../../../../../models/address';

export interface UpdateLocationEvent {
  eventItem: Event;
  location: BaseAddress;
}

@Component({
  selector: 'event-location',
  templateUrl: './event-location.component.html',
  styleUrls: ['./event-location.component.scss']
})
export class EventLocationComponent implements OnInit {
  @Input() eventItem: Event;
  @Output() onUpdateLocation: EventEmitter<UpdateLocationEvent> = new EventEmitter<UpdateLocationEvent>();
  form: FormGroup;

  constructor(private fb: FormBuilder, private el: ElementRef) { }

  ngOnInit() {
    this.form = this.fb.group({
      name: this.getLocationNameFromEvent(),
      address: this.getAddressFromEvent()
    });
    this.form.controls['address'].valueChanges.subscribe((address) => {
      if (this.eventItem.location && this.eventItem.location.address1 !== address) {
        this.form.patchValue({address: ''}, {emitEvent: false});
        this.onUpdateLocation.emit({eventItem: this.eventItem, location: null});
      }
    });
    this.form.controls['name'].valueChanges.debounceTime(500).subscribe((name) => {
      if (this.eventItem.location && this.eventItem.location.name !== name) {
        this.eventItem.location.name = name;
        this.onUpdateLocation.emit({eventItem: this.eventItem, location: this.eventItem.location });
      }
    });
  }

  updateLocation(place: google.maps.places.PlaceResult) {
    let address = BaseLocation.extractFromGooglePlaceResult(place);
    this.form.patchValue({address: address.address1}, {emitEvent: false});
    address.name = this.form.value.name;
    this.onUpdateLocation.emit({eventItem: this.eventItem, location: address});
  }

  private getAddressFromEvent(): string {
    return <string>_.get(this.eventItem, 'location.address1', '');
  }
  private getLocationNameFromEvent(): string {
    return <string>_.get(this.eventItem, 'location.name', '');
  }
}
