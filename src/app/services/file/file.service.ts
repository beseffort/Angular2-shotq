import { Injectable } from '@angular/core';

import { RestClientService } from '../rest-client/rest-client.service';


@Injectable()
export class FileService extends RestClientService<any> {
  baseUrl = 'storage/file';
}
