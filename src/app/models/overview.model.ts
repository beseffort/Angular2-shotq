import { Item } from './item';


export interface BookingOverview {
  packagePrice: number;
  selectedAddons: Item[];
  discounts: number;
  shipping: number;
  tax: number;
  totalPrice: number;
  subtotal: number;
}
