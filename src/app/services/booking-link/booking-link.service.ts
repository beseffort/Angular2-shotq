import { Injectable } from '@angular/core';
import { BookingLink } from '../../models/booking-link';
import { RestClientService } from '../rest-client/rest-client.service';


@Injectable()
export class BookingLinkService extends RestClientService<BookingLink> {
  public baseUrl = 'booking/bookinglinks';
}
