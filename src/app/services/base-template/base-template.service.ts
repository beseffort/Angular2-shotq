import { Injectable } from '@angular/core';

import 'rxjs/Rx';

import { RestClientService } from '../rest-client';
import { statusArchived, statusDraft } from '../../components/+settings/templates/choices.constant';


@Injectable()
export class BaseTemplateService<ModelClass> extends RestClientService<any> {
  public colors = [
    'green',
    'orange',

    'yellow',
    'red',
    'black',
  ];
  public statusDraft = statusDraft;
  public statusArchived = statusArchived;

  /**
   * Archive/unarchive template object
   *
   * @param {number} template
   */
  public unarchive(template) {
    template.status = this.statusDraft;
    return super.save(template);
  }

  public archive(template) {
    template.status = this.statusArchived;
    return super.save(template);
  }

  /**
   * Duplicate template
   *
   * @param {number} id Template id.
   */
  public clone(id: number) {
    return super.itemPost(id, 'duplicate');
  }
}
