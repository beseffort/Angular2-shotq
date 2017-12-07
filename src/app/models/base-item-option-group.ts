export interface BaseItemOptionGroup {
  id?: number;
  created?: Date;
  modified?: Date;
  name: string;
  description?: string;
  option_type?: string;
  required?: boolean;
  account: number;
}
