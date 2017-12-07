import { Signature } from './signature.model';

export interface BookingLink {
  account: number;
  proposal: number;
  link: string;
  signature: Signature;
}
