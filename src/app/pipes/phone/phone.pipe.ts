import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'phone'})
export class PhonePipe implements PipeTransform {

  transform(tel: string) {
    if ((typeof tel) !== 'string') {
      return tel;
    }

    tel = tel.toString().trim()
      .replace(/^\+/, '').replace(/-/, '');
    return tel.match(new RegExp('.{1,4}$|.{1,3}', 'g')).join('-');
  }
}
