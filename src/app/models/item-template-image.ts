export class ItemTemplateImage {
  id?: number; /*(required)*/
  url?: string;
  filename?: string;
  file_size?: number;
  created?: Date;
  modified?: Date;
  sequence: number;
  item_template: number;
  image: number;
}
