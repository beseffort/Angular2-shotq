import { Injectable }              from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { ProposalSettingTemplate } from '../../models/proposal-setting-template';


@Injectable()
export class ProposalSettingTemplatesService extends RestClientService<ProposalSettingTemplate> {
  baseUrl = 'booking/proposalsavedsettings';
}
