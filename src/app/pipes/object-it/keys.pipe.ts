import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'keys'})
export class KeysPipe implements PipeTransform {
  /**
   * [transform description]
   * @param  {[type]}   value [description]
   * @param  {string[]} args  [description]
   * @return {any}            [description]
   */
  transform(value, args: string[]): any {
    let keys = [];
    for (let key in value) {
      if (value.hasOwnProperty(key)) {
        keys.push({key: key, value: value[key]});
      }
    }
    return keys;
  }
}
