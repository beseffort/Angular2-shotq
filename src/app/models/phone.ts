export class Phone {
  id: number;
  created: Date;
  modified: Date;
  phone_type: number;
  number: string;
  visible: boolean;
  person: number;
  isLoading: boolean; // virtual field for contact edit

  constructor() {
    this.isLoading = false;
  }
}
