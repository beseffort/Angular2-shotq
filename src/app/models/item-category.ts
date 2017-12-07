export class ItemCategory {
  id: number; /*(required)*/
  created: Date;
  modified: Date;	
  name: string; /*(required)*/
  account: number; /*(required)*/
  item_template_count: number;
  item_count: number;
  decreased: boolean; /*virtual*/
}
