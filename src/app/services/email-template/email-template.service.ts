import { Injectable } from '@angular/core';

import 'rxjs/Rx';

import { BaseTemplateService } from '../base-template/base-template.service';
import { EmailTemplate } from '../../models/email-template.model';
import { RestClientService } from '../rest-client/rest-client.service';


@Injectable()
export class EmailTemplateService extends BaseTemplateService<EmailTemplate> {
  baseUrl = 'template/email_template';

  public static newObject(data?: object): EmailTemplate {
    return Object.assign(new EmailTemplate(), data || {});
  }
}

@Injectable()
export class EmailTemplateAttachmentsService extends RestClientService<any> {
  baseUrl = 'template/email_attachment';
}
