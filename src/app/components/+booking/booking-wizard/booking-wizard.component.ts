import { Component, ViewChild } from '@angular/core';
import { ProposalService } from '../../../services/proposal/proposal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Proposal } from '../../../models/proposal';
import { Package } from '../../../models/package';
import { Subject } from 'rxjs/Subject';
import { BookingEventDetailsComponent } from './booking-event-details/booking-event-details.component';
import { BookingOverview } from '../../../models/proposal-payment-overview.model';
import { step } from '../../shared/step-indicator/step-indicator.component';
import { ProposalSchedulePayment } from '../../../models/proposal-schedule-payment';


@Component({
  templateUrl: './booking-wizard.component.html',
  styleUrls: ['./booking-wizard.component.scss'],
})
export class BookingWizardComponent {
  @ViewChild(BookingEventDetailsComponent) eventDetailCmp: BookingEventDetailsComponent;

  steps: step[] = [
    {
      name: 'package',
      title: 'Choose a Package',
      enabled: true,
      options: {
        hasFooter: false,
      },
      valid: false,
      validate: () => !!this.proposal.approved_package
    },
    {
      name: 'addons',
      title: 'Select Optional Add-Ons',
      enabled: true,
      options: {
        hasFooter: true,
      },
      valid: false,
      validate: () => true
    },
    {
      name: 'overview',
      title: 'Review Package',
      enabled: true,
      options: {
        hasFooter: true,
      },
      valid: true,
    },
    {
      name: 'event',
      title: 'Event Details',
      enabled: true,
      options: {
        hasFooter: true,
      },
      valid: false,
    },
    {
      name: 'sign',
      title: 'Sign Contract',
      enabled: true,
      options: {
        hasFooter: false,
      },
      valid: false,
    },
    {
      name: 'payment',
      title: 'Enter Payment Information',
      enabled: false,
      options: {
        hasFooter: false,
      },
      valid: false,
    },
  ];

  currentStep = this.steps[0];
  overview: BookingOverview;
  nextStep = new Subject<any>();
  private proposal: Proposal;

  constructor(private proposalService: ProposalService,
              private route: ActivatedRoute,
              private router: Router) {

  }

  ngOnInit() {
    this.route.data
      .do(data => {
        if (data.schedule.length) {
          let schedule = data.schedule[0];
          // ref https://gearheartio.slack.com/archives/C32GBCSEM/p1498229114022878
          if (schedule.payments.some(payment => payment.due_date_type === 'at_booking')
            && !data.proposal.collect_manually) {
            let paymentStep = this.steps.find(step => step.name === 'payment');
            paymentStep.enabled = true;
            this.steps = this.steps.slice();
          }
        }
      })
      .map((data: { proposal: Proposal }) => data.proposal)
      .subscribe(this.handleProposalUpdate.bind(this));
  }


  handleProposalUpdate(proposal: Proposal) {
    this.proposal = proposal;
    this.validateSteps();
    if (this.proposal.expired) {
      this.router.navigate(['/booking', proposal.id, 'welcome']);
    }
  }

  validateSteps() {
    this.steps = this.steps.map(step => {
      if (step.validate) {
        step.valid = step.validate();
      }
      return step;
    });
  }

  onStepChange(step: step) {
    if (this.currentStep.name === 'event' && this.eventDetailCmp.valid) {
      this.eventDetailCmp.save()
        .first()
        .filter(res => res)
        .subscribe(res => {

        });
    }
    this.currentStep = step;
  }

  onPackageSelect(pckg: Package) {
    this.proposal.approved_package = pckg.id;
    this.proposalService.save(this.proposal)
      .first()
      .subscribe(proposal => {
        this.handleProposalUpdate(proposal);
        this.nextStep.next();
      });
  }

  onNext() {
    this.nextStep.next();
  }

  onFinish() {
    this.router.navigate(['/booking', this.proposal.id, 'thank-you']);
  }

  onEventDetailsValidChange(valid) {
    let eventStep = this.steps.find(item => item.name === 'event');
    eventStep.valid = valid;
    this.validateSteps();
  }

  updateOverview(overview: BookingOverview) {
    this.overview = overview;
  }

}
