export class TemplateVariable {
  public static readonly Empty = Object.assign(new TemplateVariable(), {id: -1});
  id?: number;
  name?: string;
  key?: string;
  value?: string;
  group: string;

  get isUndefined() { return !this.value; }
}
