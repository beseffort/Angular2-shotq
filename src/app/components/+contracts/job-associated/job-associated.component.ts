import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'job-associated',
  templateUrl: 'job-associated.component.html',
  styleUrls: ['job-associated.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class JobAssociatedComponent {
  public jobs: Array<any>;
  /* Array with job ids of those jobs that are checked */
  private jobsChecked = [];
  private selectAllChecked: boolean = false;
  private componentRef;

  constructor() {}

  public ngOnInit() {
    this.jobs = [
      {'id': 1, 'name': 'Virginia and Bill\'s Wedding'},
      {'id': 2, 'name': 'Visa Corp. Headshots'},
      {'id': 3, 'name': 'Byrne Family Portrait'},
      {'id': 4, 'name': 'Dora Richards Headshots'}
    ];
  }

  /**
   * Set parent component ref
   * @param {[type]} ref [reference od parent component object]
   */
  public setComponentRef(ref) {
    this.componentRef = ref;
  }

  /**
   * return if a contact is checked
   * @param {[type]}
   */
  private isChecked(job) {
    return (this.jobsChecked.indexOf(job.id) !== -1);
  }
  /**
   * Toogle the checked status of a contact
   * @param {[Contact]}
   */
  private toggleCheckJob(job) {
    if (!this.isChecked(job)) {
      this.checkJob(job);
    } else {
      this.uncheckJob(job);
    }
  }
  /**
   * check a job
   * @param {[type]}
   */
  private uncheckJob(job) {
    let i = this.jobsChecked.indexOf(job.id);
    this.jobsChecked.splice(i, 1);
    this.selectAllChecked = false;
  }

  /**
   * uncheck a job
   * @param {[type]}
   */
  private checkJob(job) {
    this.jobsChecked.push(job.id);
    if (this.jobsChecked.length === this.jobs.length) {
      this.selectAllChecked = true;
    }
  }
}
