export class JobRole {
  public static readonly Empty = new JobRole(0, '');
  id: number;
  name: string;
  display_name?: string;
  account: number;
  brand?: number;

  constructor(id?: number, name?: string, account?: number, brand?: number) {
    this.id = id;
    this.name = name;
    this.account = account;
    this.brand = brand;
  }

  toString() {
    return this.display_name || this.name;
  }
}
