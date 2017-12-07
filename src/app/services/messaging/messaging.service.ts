import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { RestClientService } from '../rest-client/rest-client.service';

const LIST_MESSAGE_URL = '/correspondence/sentcorrespondence/';
const CREATE_MESSAGE_URL = '/correspondence/correspondence/send/';
const SEND_MESSAGE_URL = '/correspondence/correspondence/:id/send/';

@Injectable()
export class MessagingService {
  constructor(private apiService: ApiService) {
  }

  createMessage(message) {
    return this.apiService.post(CREATE_MESSAGE_URL,
      Object.assign({}, message, {
        account: this.apiService.getAccount()
      }));
  }

  sendMessageById(id) {
    return this.apiService.post(SEND_MESSAGE_URL.replace(':id', id), {});
  }

  getList(params?: object) {
    return this.apiService.get(
      LIST_MESSAGE_URL, null, RestClientService._getSearchParams(params));
  }
}
