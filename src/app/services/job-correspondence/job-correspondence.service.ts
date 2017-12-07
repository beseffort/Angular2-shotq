import { Injectable } from '@angular/core';
import { ApiService } from '../api';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

@Injectable()
export class JobCorrespondenceService {
  private correspondenceEP: string = '/job/job/';
  private email: string = '/correspondence/';
  private proposals: string = '/proposals/';
  private questionnaires: string = '/questionnaires/';

  constructor(private apiService: ApiService) {
  }

  /**
   * Function to get job corresponcence
   *
   * @param {string} Job id
   */
  public getJobCorrespondence(id) {
    return this.apiService.get(`${this.correspondenceEP}${id}${this.email}`);
  }

  /**
   * Function to get job proposals
   *
   * @param {string} Job id
   */
  public getJobProposals(id) {
    return this.apiService.get(`${this.correspondenceEP}${id}${this.proposals}`);
  }

  /**
   * Function to get job questionnaires
   *
   * @param {string} Job id
   */
  public getJobQuestionnaires(id) {
    return this.apiService.get(`${this.correspondenceEP}${id}${this.questionnaires}`);
  }
}
