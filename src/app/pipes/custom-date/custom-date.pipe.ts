import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { GeneralFunctionsService } from '../../services/general-functions';

@Pipe({name: 'date'})
export class CustomDatePipe implements PipeTransform {
  constructor(private datePipe: DatePipe, private generalFunctions: GeneralFunctionsService) {}
  /**
   * [transform description]
   * @param {string} value [description]
   */
  transform(value: any, format: string) {
    return this.datePipe.transform(this.generalFunctions.sanitizeDate(value), format);
  }
}
