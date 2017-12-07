import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'capitalize'})
export class CapitalizePipe implements PipeTransform {
  /**
   * [transform description]
   * @param {string} value [description]
   */
  transform(value: string) {
    if ((typeof value) !== 'string') {
      return value;
    }
    // value = value.split(/(?=[A-Z])/).join(' ');
    value = value.replace(/_/g, ' ');
    value = value.replace(/^á|^é|^í|^ó|^ú| á| é| í| ó| ú| \w|^\w/g, l => l.toUpperCase());
    return value;
  }
}
