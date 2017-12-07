import * as _ from 'lodash';
declare let require: (any);
import { Role } from './role';
import { ContactDate } from './contact-date';
import { Phone } from './phone';
import { Email } from './email';
import { Address, BaseAddress } from './address';
import { SocialNetwork } from './social-network';
import { CustomField } from './custom-field';
import { EmailType } from './email-type';
import { PhoneType } from './phone-type';
import { GeneralFunctionsService } from '../services/general-functions/general-functions.service';

export const DEFAULT_CONTACT_PICTURE_URL = 'assets/img/avatar.png';

export class ContactType {
  id: number = null;
  created: string;
  modified: string;
  name: string;
  slug: string;
  account: number;
}

export class DefaultAddressDetails extends BaseAddress {
  id: number = null;
  created: Date;
  modified: Date;
  visible: boolean;
  contact: number;
}

export class DefaultEmailDetails {
  id: number = null;
  email_type_details: EmailType;
  created: Date;
  modified: Date;
  address: string;
  visible: boolean;
  email_type: number;
  contact: number;
}

export class DefaultPhoneDetails {
  id: number = null;
  phone_type_details: PhoneType;
  created: Date;
  modified: Date;
  number: string;
  visible: boolean;
  phone_type: number;
  contact: number;
}


/**
 * Contact post definition in ShootQ API: http://54.201.93.194:8000/apidocs/#!/contact/post_api_v1_person_contact
 */
export class Contact {
  static readonly Empty: Contact = Object.assign(new Contact(), {id: -1});
  id: number = 0;
  emails: Array<Email> = []; // required
  phones: Array<Phone> = []; // required
  addresses: Array<Address> = []; // required
  custom_fields: Array<CustomField> = [];
  modified: Date;
  created: Date;
  person_type: string;
  first_name: string; // required
  last_name: string; // required
  maiden_name: string;
  company_name: string;
  active: boolean;
  archived: string;
  user: string;
  account: string; // required
  default_email: string | number;
  default_email_details?: DefaultEmailDetails | any = {};
  default_phone: string | number;
  default_phone_details: DefaultPhoneDetails | any = {};
  default_address: string | number;
  default_address_details?: DefaultAddressDetails | any = {};
  address: any;
  default_social_network: string;
  default_social_network_details: any;
  brands: string; // required
  social_networks: Array<SocialNetwork> = [];
  contact_types: Array<number> = [];
  dates: Array<ContactDate> = [];
  /* Additional fields */
  treat_as_company: boolean;
  city: string;
  state: string;
  zip: number;
  country: string;
  img: string;
  avatar: number;
  avatar_url: string;
  roles: Role[] = [];
  /* Stats fields */
  balance_due: number;
  balance_overdue: number;
  next_due_date: number;
  total_revenue: number;
  /* virtual fields */
  has_relations?: boolean;
  over: boolean; // used on job header
  equal_phones: Array<Phone> = []; // used on merge contact
  equal_addresses: Array<Address> = []; // used on merge contact
  equal_social_networks: Array<SocialNetwork> = []; // used on merge contact
  equal_emails: Array<Email> = []; // used on merge contact
  equal_dates: Array<ContactDate> = []; // used on merge contact
  equal_first_name: Array<any> = []; // used on merge contact
  equal_maiden_name: Array<any> = []; // used on merge contact
  equal_last_name: Array<any> = []; // used on merge contact
  equal_contact_types: Array<any> = []; // used on merge contact

  constructor(id?: number) {
    this.id = id;
    // this.contact_types = [];
  }

  get defaultEmail(): string {
    if (this.default_email_details && this.default_email_details.address)
      return this.default_email_details.address;
  }

  get defaultPhoneNumber(): string {
    if (this.default_phone_details && this.default_phone_details.number)
      return this.default_phone_details.number;
  }

  get fullName(): string {
    return [this.first_name, this.last_name].join(' ').trim();
  }

  set fullName(newName: string) {
    let nameParts = newName.trim().split(' ');
    this.first_name = _.pullAt(nameParts, 0)[0];
    this.last_name = nameParts.join(' ');
  }

  get primaryRole(): Role {
    return _.head(this.roles || []) || Role.Empty;
  }

  get profilePictureUrl(): string {
    if (_.isNil(this.avatar_url) || this.avatar_url === '')
      return DEFAULT_CONTACT_PICTURE_URL;
    return this.img;
  }

  get hasSocialProfiles(): boolean {
    let networks = this.social_networks
      .filter((value) => value.network !== SocialNetwork.WEBSITE);
    return networks.length > 0;
  }

  get facebookUserId(): string {
    let network = this.social_networks
      .find((value) => value.network === SocialNetwork.FACEBOOK);
    return network ? network.toString() : undefined;
  }

  get instagramUserId(): string {
    let network = this.social_networks
      .find((value) => value.network === SocialNetwork.INSTAGRAM);
    return network ? network.toString() : undefined;
  }

  get twitterUserId(): string {
    let network = this.social_networks
      .find((value) => value.network === SocialNetwork.TWITTER);
    return network ? network.toString() : undefined;
  }

  get websiteDisplayName(): string {
    let url = this.websiteUrl;
    if (url) {
      let parsedUrl = GeneralFunctionsService.parseUrl(url);
      return parsedUrl.hostname ? parsedUrl.hostname : undefined;
    }
  }

  get websiteUrl(): string {
    let network = this.social_networks
      .find((value) => value.network === SocialNetwork.WEBSITE);
    return network ? network.toString() : undefined;
  }
}
