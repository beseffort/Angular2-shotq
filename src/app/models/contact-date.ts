export const DATE_TYPE_ANNIVERSARY = 'anniversary';
export const DATE_TYPE_BIRTHDAY = 'birthday';

export class DateType {
  id: number = null;
  account: number;
  name: string;
  slug: string;

  get isAnniversary(): boolean {
    return this.slug === DATE_TYPE_ANNIVERSARY;
  }

  get isBirthday(): boolean {
    return this.slug === DATE_TYPE_BIRTHDAY;
  }
}

export class ContactDate {
  id: number = null;
  contact: number;
  created: string;
  date: string;
  date_type: number;
  date_type_details: DateType;
  modified: string;
  visible: true;

  get isAnniversary(): boolean {
    return this.date_type_details && this.date_type_details.isAnniversary;
  }

  get isBirthday(): boolean {
    return this.date_type_details && this.date_type_details.isBirthday;
  }
}
