import { ContractSendComponent } from '../../../+contracts/contract-send/contract-send.component';
import { ContractService } from '../../../../services/contract/contract.service';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactService } from '../../../../services/contact/contact.service';
import { SignatureService } from '../../../../services/signature/signature.service';
import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ProposalService } from '../../../../services/proposal/proposal.service';
import { JobService } from '../../../../services/job/job.service';
import { Proposal } from '../../../../models/proposal';
import { BookingLink } from '../../../../models/booking-link';
import { BookingLinkService } from '../../../../services/booking-link';
import { MessagingUiService } from '../../../shared/messaging-ui/messaging-ui.service';
import { EventService } from '../../../../services/event/event.service';
import { Modal, Overlay } from 'single-angular-modal';


@Component({
  selector: 'app-proposal-send',
  templateUrl: './proposal-send.component.html',
  styleUrls: [
    './proposal-send.component.scss',
    '../../../+contracts/contract-send/contract-send.component.scss'
  ],
  encapsulation: ViewEncapsulation.Emulated,

})
export class ProposalSendComponent extends ContractSendComponent {
  proposal: Proposal;
  bookingLinks: BookingLink[] = [];

  signatureChoices: [
    {value: 'required', label: '​Signature Required'},
    {value: 'review', label: 'Review only'}
    ];

  constructor(messagingUi: MessagingUiService,
              contractService: ContractService,
              contactService: ContactService,
              signatureService: SignatureService,
              modal: Modal,
              flash: FlashMessageService,
              router: Router,
              route: ActivatedRoute,
              vcRef: ViewContainerRef,
              overlay: Overlay,
              private jobService: JobService,
              private proposalService: ProposalService,
              private bookingLinkService: BookingLinkService) {

    super(
      messagingUi,
      contractService,
      contactService,
      signatureService,
      modal,
      flash,
      router,
      route,
      vcRef,
      overlay
    );

  }

  ngOnInit() {
    this.subscribeTemplateUpdates();
    this.route.data
      .subscribe((data: {proposal: Proposal}) => {
        this.proposal = ProposalService.newObject(data.proposal);
        this.emailSubject = this.proposal.email_subject;
        this.emailBody = this.proposal.email_contents;
        // An event is required to render a message template on the server side,
        // so we pass it to the service in case the user will try to create
        // a message from a template.
        this.messagingUi.event = EventService.newObject(this.proposal.job.main_event_details);
        this.contract = ContractService.newObject(this.proposal.contract_data);
        this.loadSignatures();
        this.loadBookingLinks();
      });

  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this.signaturesSub$)
      this.signaturesSub$.unsubscribe();
  }

  save() {
    this.proposal.email_subject = this.emailSubject;
    this.proposal.email_contents = this.emailBody;
    if (!this.emailSubject || !this.emailBody) {
      this.flash.error('Email subject and body is required fields');
      return;
    }
    this.saveRecipients()
      .switchMap(() => this.proposalService.save(this.proposal))
      .switchMap(() => this.proposalService.send(this.proposal.id))
      .subscribe((proposal: Proposal) => {
        this.proposal = ProposalService.newObject(proposal);
        this.flash.success('Proposal sent');
        this.router.navigate(['/jobs', this.proposal.job.id]);
      }, error => {
        this.flash.error('Proposal send error');
      });

  }

  get isDisabled() {
    return this.proposal && !this.proposal.isDraft && !this.proposal.isSent;
  }

  loadBookingLinks() {
    this.bookingLinkService.getList({proposal: this.proposal.id})
      .subscribe((links) => {
        this.bookingLinks = links;
      });
  }

  postSignaturesLoad() {
    if (this.signatures.length && this.bookingLinks.length) {
      this.bookingLinks = this.bookingLinks.filter(l => !!this.signatures.find(s => s.id === l.signature.id));
    }
  }
}
