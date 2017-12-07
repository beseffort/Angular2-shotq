import { Injectable } from '@angular/core';
import { TemplateVariable } from '../../models/template-variable.model';
import { RestClientService } from '../rest-client/rest-client.service';


@Injectable()
export class TemplateVariableService extends RestClientService<TemplateVariable> {
  baseUrl = 'template/template_variable';

  public static newObject(data?: object): TemplateVariable {
    return Object.assign(new TemplateVariable(), data || {});
  }
}
