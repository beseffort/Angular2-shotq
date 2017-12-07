import { Injectable } from '@angular/core';
import { ApiService } from '../api';
import { GeneralFunctionsService } from '../general-functions';
import { Discount } from '../../models/discount.model';
import {
  DiscountTemplate, CALCULATION_CHOICE_PRODUCTS_AND_SERVICES,
  CALCULATION_CHOICE_PRODUCTS, AMOUNT_CHOICE_PERCENTAGE_RATE, AMOUNT_CHOICE_FIXED
} from '../../models/discount-template.model';
import { RestClientService } from '../rest-client/rest-client.service';
import { Item, ITEM_TYPE_PRODUCT } from '../../models/item';
declare let require: (any);

@Injectable()
export class DiscountService extends RestClientService<Discount> {

  public baseUrl = 'billing/discount';


  constructor(apiService: ApiService,
              private functions: GeneralFunctionsService) {
    super(apiService);
  }

}
