import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterBy'
})
export class FilterByPipe implements PipeTransform {
  transform(items: any[], args: any[]): any {
    let unknownProp = Object.keys(args)[0];
    if (!Object.keys(args)[0]) {
      return items;
    } else if (items) {
      return items.filter(item => {
        for (let key in item) {
          /* Check if unknownProp inside of item is an array */
          if (item.hasOwnProperty(unknownProp)
            && Array.isArray(item[unknownProp])
            && item[unknownProp].indexOf(args[Object.keys(args)[0]]) !== -1
            || (Object.keys(args)[1] === 'showAll' && args[Object.keys(args)[0]] === 0)) {
              return true;
          } else
            /* Otherwise unknownProp is type number, just filter by an id */
            if (item.hasOwnProperty(unknownProp) && item[unknownProp] === args[Object.keys(args)[0]]
              || (Object.keys(args)[1]) === 'showAll' && args[Object.keys(args)[0]] === 0) {
              return true;
            }
          }
      });
    }
  }
}
