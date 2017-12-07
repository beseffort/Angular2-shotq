export class ItemTemplateOption {
  id: number; /*(required)*/
  created: Date;
  modified: Date;
  name: string; /*(required)*/
  extra_price: number | string; /*(required)*/
  extra_cogs: number; /*(required)*/
  account: number; /*(required)*/
  group: number; /*(required)*/
  showDelete: boolean;

  constructor() {
    this.account = 1;
    this.extra_cogs = 0;
    this.extra_price = 0;
    this.name = 'New Option Value';
    this.showDelete = false;
  }
}
