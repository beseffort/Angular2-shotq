import { Injectable } from '@angular/core';
import { RestClientService } from '../rest-client/rest-client.service';
import { Person } from '../../models/person';

@Injectable()
export class PersonService extends RestClientService<Person> {
  baseUrl = 'person/contact';

  update(data) {
    return super.update(data.id, data);
  }
}
