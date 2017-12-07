import { Injectable } from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { SocialNetwork } from '../../models/social-network';

@Injectable()
export class SocialNetworkService extends RestClientService<SocialNetwork> {
  baseUrl = 'person/social_network';

  update(data) {
    return super.update(data.pk, data);
  }

  get() {
    return this.getList();
  }
}
