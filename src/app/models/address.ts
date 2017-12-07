import * as _ from 'lodash';
import * as addressParser from 'parse-address';
import { } from '@types/googlemaps'; // tslint:disable-line

export class BaseAddress {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;



  static parse(address: string): BaseAddress {
    let result = new BaseAddress();
    let parsedData = addressParser.parseLocation(address);
    if (parsedData) {
      result.country = 'US';  // the parser support US addresses only
      result.zip = parsedData.zip || '';
      result.state = parsedData.state || '';
      result.city = parsedData.city || '';
      result.address1 = [
        parsedData.number || '',
        parsedData.street || '',
        parsedData.type || ''
      ].join(' ').trim();
      result.address2 = [
        parsedData.sec_unit_type || '',
        parsedData.sec_unit_num || ''
      ].join(' ').trim();
      return result;
    }
    return;
  }

  static addressComponentExtract(components: google.maps.GeocoderAddressComponent[], type: string) {
    return (_.find(components, c => _.includes(c.types, type)) || {short_name: ''}).short_name;
  }

  static extractFromGooglePlaceResult(place: google.maps.places.PlaceResult): BaseAddress {
    let components = place.address_components;
    let result = new BaseAddress();
    result.address1 = place.formatted_address;
    result.city = BaseAddress.addressComponentExtract(components, 'locality');
    result.state = BaseAddress.addressComponentExtract(components, 'administrative_area_level_1');
    result.country = BaseAddress.addressComponentExtract(components, 'country');
    result.zip = BaseAddress.addressComponentExtract(components, 'postal_code');
    return result;
  }

  toString(): string {
    return [
      this.address1,
      this.address2,
      this.city, this.state, this.zip,
      // the country part makes the address unrecognizable by the parser
      // this.country
    ].join(' ').trim();
  }
}

export class Address extends BaseAddress {
  id: number;
  created: Date;
  visible: boolean;
  person: number;
  opened: boolean;
  name: string;
  account: number;
  isLoading: boolean; // virtual field for contact edit

  constructor() {
    super();
    this.isLoading = false;
  }
}

export class BaseLocation extends BaseAddress {
  name: string;

  static extractFromGooglePlaceResult(place: google.maps.places.PlaceResult): BaseLocation {
    let components = place.address_components;
    let result = new BaseLocation();
    result.address1 = place.formatted_address;
    result.city = BaseAddress.addressComponentExtract(components, 'locality');
    result.state = BaseAddress.addressComponentExtract(components, 'administrative_area_level_1');
    result.country = BaseAddress.addressComponentExtract(components, 'country');
    result.zip = BaseAddress.addressComponentExtract(components, 'postal_code');
    return result;
  }
}
