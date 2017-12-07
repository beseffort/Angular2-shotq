export class Email {
  id: number;
  created: Date;
  email_type: number;
  address: string;
  visible: boolean;
  contact: number;

  // extra properties, not included in the `EmailSerializer`
  person: number;
  isLoading: boolean; // virtual field for contact edit

  constructor() {
    this.isLoading = false;
  }
}
