import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GeneralFunctionsService } from 'app/services';
import * as _ from 'lodash';
import * as textClipper from 'text-clipper';
import {
  CORRESPONDENCE_TYPE_CONTRACT,
  CORRESPONDENCE_TYPE_PROPOSAL,
  CORRESPONDENCE_TYPE_QUESTIONNAIRE,
  SentCorrespondence
} from '../../../models/sentcorrespondence';
import { Recipient } from '../../../models/recipient';

const TRUNCATED_TEXT_INDICATOR = '&hellip;';
const DEFAULT_MAX_LINES_COUNT = 5;
const DEFAULT_MAX_WORDS_COUNT = 45;

@Component({
  selector: 'correspondence-list',
  templateUrl: './correspondence-list.component.html',
  styleUrls: ['./correspondence-list.component.scss']
})
export class CorrespondenceListComponent {
  @Input() maxWords = DEFAULT_MAX_WORDS_COUNT;
  @Input() maxLines = DEFAULT_MAX_LINES_COUNT;
  @Output() displayMessage = new EventEmitter<SentCorrespondence>();

  //noinspection JSUnusedGlobalSymbols
  @Input() get correspondence(): SentCorrespondence[] {
    return this._correspondence;
  }

  private _correspondence: SentCorrespondence[] = [];

  //noinspection JSUnusedGlobalSymbols
  set correspondence(value: SentCorrespondence[]) {
    this.resetCorrespondence(value);
  }

  constructor(private generalFunctions: GeneralFunctionsService) {
  }

  private resetCorrespondence(value: SentCorrespondence[]) {
    this._correspondence = _.map(value, message => {
      let words = _.words(this.generalFunctions.removeHtmlTags(message.body));
      let maxCharCount = _.take(words, this.maxWords).join(' ').length;
      let nameParts = _.take(_.words(message.sender_name || ''), 2);
      let messageType = _.head(message.correspondence_types || []) || '';
      let result = Object.assign(new SentCorrespondence(), message, {
        sender_name: message.sender_name || '',
        $senderFirstName: _.head(nameParts) || '',
        $senderInitials: _.map(nameParts, (s: string) => s[0]).join('').toLocaleUpperCase(),
        $senderPictureUrl: null,
        $isContract: messageType === CORRESPONDENCE_TYPE_CONTRACT,
        $isProposal: messageType === CORRESPONDENCE_TYPE_PROPOSAL,
        $isQuestionnaire: messageType === CORRESPONDENCE_TYPE_QUESTIONNAIRE,
        $truncatedBody: textClipper(message.body, maxCharCount,
        {html: true, indicator: TRUNCATED_TEXT_INDICATOR, maxLines: this.maxLines})
      });
      _.each(result.recipients, (recipient: Recipient) => {
        let recipientNameParts = _.take(_.words(recipient.recipient_name), 2);
        recipient['$firstName'] = _.startCase(_.head(recipientNameParts) || '');
        recipient['$initials'] = _.upperCase(_.map(recipientNameParts, s => s[0]).join(''));
      });
      return result;
    });
  }

  //noinspection JSUnusedLocalSymbols
  private onMessageClicked(message: SentCorrespondence) {
    this.displayMessage.emit(message);
  }
}
