export class Role {
  public static readonly Empty = new Role(0, '');
  id: number;
  name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}
