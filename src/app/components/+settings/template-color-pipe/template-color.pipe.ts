import { Pipe, PipeTransform } from '@angular/core';

const TEMPLATE_COLORS = [
  'green',
  'orange',
  'yellow',
  'red',
  'black',
];

@Pipe({name: 'templateColorPipe'})
export class TemplateColorPipe implements PipeTransform {
  transform(id: number): string {
    return `is-${TEMPLATE_COLORS[id % TEMPLATE_COLORS.length]}`;
  }
}
