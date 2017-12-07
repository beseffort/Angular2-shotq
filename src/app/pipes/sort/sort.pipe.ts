import { PipeTransform, Pipe } from '@angular/core';

import { GeneralFunctionsService } from '../../services/general-functions/general-functions.service';


@Pipe({name: 'sort', pure: false})
export class SortPipe implements PipeTransform {
  constructor (public helpers: GeneralFunctionsService) {
  }

  transform(input: any, config?: any): any[] {
    if (!Array.isArray(input)) {
      return input;
    }

    const out = [...input];

    // sort by multiple properties
    if (Array.isArray(config)) {
      return out.sort((a, b) => {
        for (let i = 0, l = config.length; i < l; ++i) {
          const [prop, asc] = this.extractFromConfig(config[i]);
          const pos = this.orderCompare(prop, asc, a, b);
          if (pos !== 0) {
            return pos;
          }
        }
        return 0;
      });
    }

    // sort by a single property value
    if (this.helpers.isString(config)) {
      const [prop, asc, sign] = this.extractFromConfig(config);

      if (config.length === 1) {
        switch (sign) {
          case '+': return out.sort(this.simpleSort.bind(this));
          case '-': return out.sort(this.simpleSort.bind(this)).reverse();
          default: return;
        }
      }

      return out.sort(this.orderCompare.bind(this, prop, asc));
    }

    // default sort by value
    return out.sort(this.simpleSort.bind(this));
  }

  private simpleSort(a: any, b: any) {
    return this.helpers.isString(a) && this.helpers.isString(b)
      ? a.toLowerCase().localeCompare(b.toLowerCase())
      : a - b;
  }

  private orderCompare(prop: string, asc: boolean, a: any, b: any) {
    const first = this.helpers.extractDeepPropertyByMapKey(a, prop),
          second = this.helpers.extractDeepPropertyByMapKey(b, prop);

    if (first === second) {
      return 0;
    }

    if (this.helpers.isUndefined(first) || first === '') {
      return 1;
    }

    if (this.helpers.isUndefined(second) || second === '') {
      return -1;
    }

    if (this.helpers.isString(first) && this.helpers.isString(second)) {
      const pos = first.toLowerCase().localeCompare(second.toLowerCase());
      return asc ? pos : -pos;
    }

    return asc
      ? first - second
      : second - first;
  }

  private extractFromConfig(config: any) {
    const sign = config.substr(0, 1);
    const prop = config.replace(/^[-+]/, '');
    const asc = sign !== '-';

    return [prop, asc, sign];
  }

}
