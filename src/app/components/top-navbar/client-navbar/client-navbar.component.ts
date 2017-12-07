import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { Job } from '../../../models/job';
import { JobService } from '../../../services/job';


@Component({
  selector: 'client-navbar',
  templateUrl: './client-navbar.component.html',
  styleUrls: ['./client-navbar.component.scss']
})
export class ClientNavbarComponent implements OnInit {
  isMenuCollapsed: boolean = true;
  jobs: Job[] = [];
  currentJob: Job;
  currentJobId: number;

  constructor(
    private router: Router,
    private location: Location,
    private jobService: JobService
  ) { }

  ngOnInit() {
    this.initCurrentJobId();
    this.router.events.filter(e => e instanceof NavigationEnd).subscribe((e: NavigationEnd) => {
      this.initCurrentJobId();
    });
    this.jobService.getList().subscribe(this.extractJobs.bind(this));
  }

  selectJob(job: Job) {
    this.setCurrentJob(job);
    this.currentJobId = null;
    this.router.navigate(['/public/client-access', job.id, this.getTabUrl()]);
  }

  private extractJobs(res) {
    this.jobs = res.jobs;
    if (this.currentJobId) {
      let currentJob = this.jobs.find(j => j.id === this.currentJobId);
      this.setCurrentJob(currentJob);
    }
  }

  private setCurrentJob(job: Job) {
    this.currentJob = job;
  }

  private initCurrentJobId() {
    let currentPath = this.location.path();
    let clientPageRegExp = /public\/client-access\/(\d+)\//;
    let result = currentPath.match(clientPageRegExp);
    if (result) {
      this.currentJobId = Number(result[1]);
    }
  }

  private getTabUrl() {
    let currentPath = this.location.path().split('?')[0];
    let result = currentPath.split('/');
    return result ? result[result.length - 1] : '';
  }

}
